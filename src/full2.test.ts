import fs from "fs";
import path from "path";
import { debug } from "webpack";
import { buildAST, transformAST, ASTNode } from "./full2";

const _path = (name) => path.join(__dirname, "../samples", name);
const paths = {
  bitfield: _path("bitfield.tsb"),
  log: _path("simple-runonly.tsb"),
  sizeof: _path("simple-build-only.tsb"),
  inlineBuild: _path("simple-inline-build.tsb"),
  hoursFormatter: _path("simple-nested-once.tsb"),
  inlineBuildInsideRun: _path("inline-build-inside-run.tsb"),
  interpolatedBuild: _path("interpolated-build.tsb"),
  multipleInlineFields: _path("multiple-inline-fields.tsb"),
};
const SAMPLES = {
  bitfield: fs.readFileSync(paths.bitfield, "utf8"),
  log: fs.readFileSync(paths.log, "utf8"),
  sizeof: fs.readFileSync(paths.sizeof, "utf8"),
  inlineBuild: fs.readFileSync(paths.inlineBuild, "utf8"),
  hoursFormatter: fs.readFileSync(paths.hoursFormatter, "utf8"),
  inlineBuildInsideRun: fs.readFileSync(paths.inlineBuildInsideRun, "utf8"),
  interpolatedBuild: fs.readFileSync(paths.interpolatedBuild, "utf8"),
  multipleInlineFields: fs.readFileSync(paths.multipleInlineFields, "utf8"),
};

describe("Full2", () => {
  process.env.NODE_ENV = "test";
  let ast: ASTNode, code: string, source: string;
  function run(file) {
    ast = buildAST((source = SAMPLES[file]), paths[file]);
    code = transformAST(ast, source);
    fs.writeFileSync(paths[file] + ".out.js", code);
    fs.writeFileSync(
      paths[file] + ".ast.json",
      JSON.stringify(ast.toJSON(), null, 2)
    );
    return code;
  }

  it("contains no duplicate nodes", function () {
    run("bitfield");

    let seen = new Set();
    function recursiveSeen(visitor) {
      for (let node of visitor.children) {
        if (seen.has(node)) {
        }
        expect(seen.has(node)).toBe(false);
        seen.add(node);

        if (node.children) {
          recursiveSeen(visitor);
        }
      }
    }

    recursiveSeen(ast);
  });

  it("loads inlineBuild sample", () => {
    run("inlineBuild");
  });

  it("loads bitfield sample", () => {
    run("bitfield");
  });

  it("loads hoursFormatter sample", () => {
    run("hoursFormatter");
    debugger;
  });

  it("loads log sample", () => {
    code = run("log");
  });

  it("inline build inside run", () => {
    code = run("inlineBuildInsideRun");
  });

  it("interpolated build inside run", () => {
    code = run("interpolatedBuild");
  });

  it("multiple inline fields", () => {
    code = run("multipleInlineFields");
  });
});
