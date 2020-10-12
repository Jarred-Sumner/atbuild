import { AtBuild } from "./atbuild";
import path from "path";
import fs from "fs";

describe("AtBuild", function () {
  it("parses build-time code", function () {
    const first = `
    @let i = 0;
    @for (i = 0; i < 10; i++) {
      console.log("@{i}Hello World @{i}");
    @}

    module.exports = @{i};
`;
    expect(AtBuild.eval(first)).toBe(10);
  });

  it("displays errors", function () {
    const first = `
    @for (lst ERROR_SHOULD_BE_HERE!) {
      console.log("@{i}Hello World @{i}");
    @}
`;
    expect(() =>
      AtBuild.eval(first, path.resolve(__dirname, "../samples/hello-world.@js"))
    ).toThrow();
  });

  it("parses build-time code from file", function () {
    expect(
      AtBuild.evalFile(
        path.resolve(__dirname, "../samples/hello-world.@js"),
        false
      )
    ).toBe(5);
  });
});
