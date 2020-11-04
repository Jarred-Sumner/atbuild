import fs from "fs";
import path from "path";
import { buildAST, transformAST, ASTNode } from "./full2";

const _path = (name) => path.join(__dirname, "../samples", name);
const paths = {
  bitfield: _path("bitfield.tsb"),
  log: _path("simple-runonly.tsb"),
  sizeof: _path("simple-build-only.tsb"),
  hoursFormatter: _path("simple-nested-once.tsb"),
};
const SAMPLES = {
  bitfield: fs.readFileSync(paths.bitfield, "utf8"),
  log: fs.readFileSync(paths.log, "utf8"),
  sizeof: fs.readFileSync(paths.sizeof, "utf8"),
  hoursFormatter: fs.readFileSync(paths.hoursFormatter, "utf8"),
};

describe("Full2", () => {
  process.env.NODE_ENV = "test";
  let ast: ASTNode, code: string;
  function run(file) {
    ast = buildAST(SAMPLES[file], paths[file]);
    code = transformAST(ast);
    fs.writeFileSync(paths[file] + ".out.js", code);
    return code;
  }

  it("loads bitfield sample", () => {
    run("bitfield");
    debugger;
  });

  it("loads log sample", () => {
    code = run("log");

    debugger;
  });
});
