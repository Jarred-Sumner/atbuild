import { AtBuild } from "../atbuild";
import { createFsFromVolume, Volume } from "memfs";
import { webpack } from "../../test/helpers";

describe("AtBuild Webpack Loader", function () {
  it("works", async function () {
    expect.assertions(1);

    const [_result, fs] = await webpack("./samples/hello-worldtest");

    const result = fs.readFileSync(
      _result.compilation.compiler.outputPath + "/bundle.js",
      "utf8"
    );

    expect(result.includes("hello-world.@js")).toBe(true);
  });

  it("works async", async function () {
    expect.assertions(1);

    const [_result, fs] = await webpack("./samples/hello-async");

    const result = fs.readFileSync(
      _result.compilation.compiler.outputPath + "/bundle.js",
      "utf8"
    );

    expect(result.includes("hello-async.@js")).toBe(true);
  });
});
