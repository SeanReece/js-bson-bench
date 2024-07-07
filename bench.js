var Benchmark = require("benchmark");
const bson = require("bson");
const bsonSTR = require("bson-test");

const ObjectId = bson.ObjectId;
const ObjectIdSTR = bsonSTR.ObjectId;

// Enable these to test with caching
// ObjectId.cacheHexString = true
// ObjectIdSTR.cacheBuffer = true

function createSmallDoc(ObjId) {
  return {
    _id: new ObjId("65c25acbb7342bbb4e84253a"),
  };
}

function createLargeDoc(ObjId) {
  return {
    _id: new ObjId("65c25acbb7342bbb4e84253a"),
    typeId: new ObjId("65c25acbb7342bbb4e84253b"),
    tenantId: new ObjId("65c25acbb7342bbb4e84253c"),
    createdBy: new ObjId("65c25acbb7342bbb4e84253d"),
    createdAt: new Date("2021-06-17T20:50:25.000Z"),
    properties: {
      Text: "Some reasonably long text that is not too long but long enough to be interesting",
      Number: 83936,
      Date: new Date("2034-06-17T20:50:25.000Z"),
      Boolean: false,
      // lookups: [
      //   new ObjId("65c25acbb7342bbb4e84253e"),
      //   new ObjId("65c25acbb7342bbb4e84253f"),
      //   new ObjId("65c25acbb7342bbb4e84254a"),
      // ],
    },
  };
}

const doc = createSmallDoc(ObjectId);
const docStr = createSmallDoc(ObjectIdSTR);

const docBuf = bsonSTR.serialize(doc);
const docBufStr = bsonSTR.serialize(docStr);

const largeDoc = createLargeDoc(ObjectId);
const largeDocStr = createLargeDoc(ObjectIdSTR);

const largeDocBuf = bsonSTR.serialize(largeDoc);
const largeDocBufStr = bsonSTR.serialize(largeDocStr);

const ids = [];
const idsSTR = [];
const PROCESS_UNIQUE = "abcde";
const inc = 12351;

for (let i = 0; i < 1000; i++) {
  let id = new ObjectId();
  ids.push(id);
  idsSTR.push(new ObjectIdSTR(id.id));
}

var suite = new Benchmark.Suite();

let lastCycleResult = 0;
let i = 0;

const time = Math.floor(Date.now() / 1000);
const hexTime = time.toString(16);

let buffer = Buffer.allocUnsafe(1000);
ids[0].id.copy(buffer, 100);

// let bef = process.memoryUsage().heapUsed

// add tests
suite
  // Test parseInt vs buffer.from to copy hex string to buffer
  .add("buffer.from + copy", function () {
    const hex = "48656c6c6f20576f726c64";
    const buff = Buffer.from(hex, "hex");
    for (let i = 0; i < 12; i++) {
      buffer[i] = buff[i];
    }
  })
  .add("parseInt", function () {
    const hex = "48656c6c6f20576f726c64";
    for (let i = 0; i < 12; i++) {
      buffer[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return buffer;
  })
  // Test buffer.write vs buffer.from to copy hex string to buffer
  .add("buffer.from + copy", function () {
    const hex = "48656c6c6f20576f726c64";
    const buff = Buffer.from(hex, "hex");
    for (let i = 0; i < 12; i++) {
      buffer[i] = buff[i];
    }
  })
  .add("buffer.write", function () {
    const hex = "48656c6c6f20576f726c64";

    return buffer.write(hex, 0, 12, "hex");
  })

  // -------- BSON Tests ---------
  .add("bson#serialize", function () {
    bson.serialize(doc);
  })
  .add("bsonSTR#serialize", function () {
    bsonSTR.serialize(docStr);
  })
  .add("bson#deserialize", function () {
    bson.deserialize(docBuf);
  })
  .add("bsonSTR#deserialize", function () {
    bsonSTR.deserialize(docBufStr);
  })

  .add("bson#serialize large doc", function () {
    bson.serialize(largeDoc);
  })
  .add("bsonSTR#serialize large doc", function () {
    bsonSTR.serialize(largeDocStr);
  })
  .add("bson#deserialize large doc", function () {
    bson.deserialize(largeDocBuf);
  })
  .add("bsonSTR#deserialize large doc", function () {
    bsonSTR.deserialize(largeDocBufStr);
  })

  .add("bson#new ObjectId()", function () {
    new ObjectId();
  })
  .add("bsonSTR#new ObjectId()", function () {
    new ObjectIdSTR();
  })

  .add("bson#new ObjectId(buffer)", function () {
    const oid = Buffer.allocUnsafe(12);
    for (let i = 0; i < 12; i++) oid[i] = buffer[100 + i];
    new ObjectId(oid);
  })
  .add("bsonSTR#new ObjectId(buffer)", function () {
    new ObjectIdSTR(buffer, 100);
  })

  .add("bson#new ObjectId() + serialize", function () {
    const a = new ObjectId();
    a.toJSON();
  })
  .add("bsonSTR#new ObjectId() + serialize", function () {
    const a = new ObjectIdSTR();
    a.toJSON();
  })

  .add("bson#new ObjectId(string)", function () {
    const i = Math.floor(Math.random() * ids.length);
    new ObjectId(idsSTR[i].toHexString());
  })
  .add("bsonSTR#new ObjectId(string)", function () {
    const i = Math.floor(Math.random() * ids.length);
    new ObjectIdSTR(idsSTR[i].toHexString());
  })

  .add("bson#fromExtendedJSON", function () {
    const i = Math.floor(Math.random() * ids.length);
    ObjectId.fromExtendedJSON({ $oid: idsSTR[i].toHexString() });
  })
  .add("bsonSTR#fromExtendedJSON", function () {
    const i = Math.floor(Math.random() * ids.length);
    ObjectIdSTR.fromExtendedJSON({ $oid: idsSTR[i].toHexString() });
  })

  .add("bson#toExtendedJSON", function () {
    const i = Math.floor(Math.random() * ids.length);
    ids[i].toExtendedJSON();
  })
  .add("bsonSTR#toExtendedJSON", function () {
    const i = Math.floor(Math.random() * ids.length);
    idsSTR[i].toExtendedJSON();
  })

  .add("bson#toHexString", function () {
    const i = Math.floor(Math.random() * ids.length);
    ids[i].toHexString();
  })
  .add("bsonSTR#toHexString", function () {
    const i = Math.floor(Math.random() * ids.length);
    idsSTR[i].toHexString();
  })

  .add("bson#equals", function () {
    const i = Math.floor(Math.random() * ids.length);
    const j = Math.floor(Math.random() * ids.length);
    ids[i].equals(ids[j]);
  })
  .add("bsonSTR#equals", function () {
    const i = Math.floor(Math.random() * ids.length);
    const j = Math.floor(Math.random() * ids.length);
    idsSTR[i].equals(idsSTR[j]);
  })

  .add("bson#equals-string", function () {
    const i = Math.floor(Math.random() * ids.length);
    const j = Math.floor(Math.random() * ids.length);
    ids[i].equals(idsSTR[j].toHexString());
  })
  .add("bsonSTR#equals-string", function () {
    const i = Math.floor(Math.random() * ids.length);
    const j = Math.floor(Math.random() * ids.length);
    idsSTR[i].equals(idsSTR[j].toHexString());
  })

  .add("bson#getTimestamp", function () {
    const i = Math.floor(Math.random() * ids.length);
    ids[i].getTimestamp();
  })
  .add("bsonSTR#getTimestamp", function () {
    const i = Math.floor(Math.random() * ids.length);
    idsSTR[i].getTimestamp();
  })

  .add("bson#serializeInto", function () {
    ids[0].serializeInto(buffer, 0);
  })
  .add("bsonSTR#serializeInto", function () {
    idsSTR[0].serializeInto(buffer, 0);
  })

  .add("bson#createFromTime", function () {
    ObjectId.createFromTime(time);
  })
  .add("bsonSTR#createFromTime", function () {
    ObjectIdSTR.createFromTime(time);
  })

  .add("bson#isValid", function () {
    ObjectId.isValid("6683fe22cd402749418c7e2b");
    ObjectId.isValid("hello world");
  })
  .add("bsonSTR#isValid", function () {
    ObjectIdSTR.isValid("6683fe22cd402749418c7e2b");
    ObjectIdSTR.isValid("hello world");
  })

  .on("cycle", function (event) {
    // const aft = process.memoryUsage().heapUsed
    // console.log(`Memory: ${(aft - bef) / 1024 / 1024}MB`)
    // buf = process.memoryUsage().heapUsed
    console.log(String(event.target));
    const percentImprovement =
      ((event.target.hz - lastCycleResult) / lastCycleResult) * 100;
    lastCycleResult = event.target.hz;
    if (i++ % 2 === 0) {
      return;
    }
    console.log(`(${percentImprovement.toFixed(2)}%)`);
  })
  .on("complete", function () {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  // run async
  .run({ async: true });
