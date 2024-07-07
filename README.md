# js-bson-bench

Some js-bson benchmarks to test changes in https://github.com/mongodb/js-bson/pull/703

## Running the benchmarks

- git clone this repo
- Pull the PR branch of js-bson (js-bson must be installed at ../js-bson relative to this repo)
- rename `bson` to `bson-test` in `js-bson/package.json`. This allows the benchmarks to compare the PR branch with the current bson in the same run.

```bash
npm install
node bench.js
```
