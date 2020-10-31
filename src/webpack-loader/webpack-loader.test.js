import { AtBuild } from "../atbuild";
import { createFsFromVolume, Volume } from "memfs";
import { webpack } from "../../test/helpers";

describe("AtBuild Webpack Loader", function () {
  jest.setTimeout(30000);

  it("works sync", async function () {
    expect.assertions(1);

    const [_result, fs] = await webpack("./samples/hello-require");

    const result = fs.readFileSync(
      _result.compilation.compiler.outputPath + "/bundle.js",
      "utf8"
    );
    expect(result.includes("hello-require.@js")).toBe(true);
  });

  it("works nested requires", async function () {
    expect.assertions(1);

    const [_result, fs] = await webpack("./samples/hello-nested-require");

    const result = fs.readFileSync(
      _result.compilation.compiler.outputPath + "/bundle.js",
      "utf8"
    );
    // expect(result.includes("hello-nested-require.@js")).toBe(true);
    expect(result).toContain(`module.exports = "Hi"`);
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
