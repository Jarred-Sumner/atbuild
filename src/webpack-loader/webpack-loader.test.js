import { AtBuild } from "../atbuild";
import { createFsFromVolume, Volume } from "memfs";
import { webpack } from "../../test/helpers";

describe("AtBuild Webpack Loader", function () {
  it("works", async function () {
    expect.assertions(2);

    const { result } = await webpack("./samples/hello-world.@js");

    const code = AtBuild.evalFile("./samples/hello-world.@js", true);
    expect(result[0]).toBe(code);
    expect(eval(code)).toBe(5);
  });
});
