const { transformAST, buildAST } = require("../dist/full2");
const Benchmark = require("benchmark");
const fs = require("fs");
const path = require("path");

const _path = (name) => path.join(__dirname, "../samples", name);
const paths = {
  bitfield: _path("bitfield.tsb"),
  log: _path("simple-runonly.tsb"),
  sizeof: _path("simple-build-only.tsb"),
  inlineBuild: _path("simple-inline-build.tsb"),
  hoursFormatter: _path("simple-nested-once.tsb"),
};
const SAMPLES = {
  bitfield: fs.readFileSync(paths.bitfield, "utf8"),
  log: fs.readFileSync(paths.log, "utf8"),
  sizeof: fs.readFileSync(paths.sizeof, "utf8"),
  inlineBuild: fs.readFileSync(paths.inlineBuild, "utf8"),
  hoursFormatter: fs.readFileSync(paths.hoursFormatter, "utf8"),
};

const suite = new Benchmark.Suite();
const ast = buildAST(SAMPLES.bitfield);
suite
  .add("BitField build+transformAST", function () {
    transformAST(buildAST(SAMPLES.bitfield));
  })
  .add("BitField buildAST", function () {
    buildAST(SAMPLES.bitfield);
  })
  .add("Bitfield TransformAST", function () {
    transformAST(ast);
  })
  .on("cycle", function (event) {
    console.log(String(event.target));
  })
  .on("complete", function () {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: false });
