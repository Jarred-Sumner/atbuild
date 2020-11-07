import { AtBuild } from "./atbuild";
import path from "path";
import fs from "fs";
import Module from "module";

describe("AtBuild", function () {
  it("supports require", function () {
    const first = `
    module.exports = "@{require("../package.json").version}"`;
    const result = AtBuild.eval(first, "_test.js");
    expect(eval(result)).toBe(require("../package.json").version);
  });
  it("parses build-time code", function () {
    const first = `
    @let i = 0;
    @for (i = 0; i < 10; i++) {
      console.log("@{i}Hello World @{i}");
    @}

    module.exports = @{i};`;
    const mod = new Module("test.js", module);
    const result = AtBuild.eval(first, "_test.js");
    mod._compile(result, "__test.js");
    expect(mod.exports).toBe(10);
  });

  it("escapes build-time code correctly", function () {
    const first = `
    ## Contrived example:

    \`\`\`js
    // hello-world.@js
    @@var hi = 0;

    @@for (let i = 0; i < 5; i++) {
      console.log("Hello World @{i}");
      @@hi++;
    @@}

    module.exports = @@{hi};
    \`\`\`
    `;
    const mod = new Module("test.js", module);
    const result = AtBuild.eval(first, "_test.js");
    mod._compile(result, "__test.js");
    expect(mod.exports).toBe(first);
  });

  it("parses multiline build-time code", function () {
    const first = `
    @var count = 0;
    @@function increment() {
      count++;
    @@}

    @for (i = 0; i < 10; i++) {
      console.log("@{i}Hello World @{i}");
      @increment();
    @}

    module.exports = @{count};`;
    const mod = new Module("test.js", module);
    const result = AtBuild.eval(first, "_test.js");
    console.log(result);
    mod._compile(result, "__test.js");
    expect(mod.exports).toBe(10);
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
      eval(
        AtBuild.evalFile(
          path.resolve(__dirname, "../samples/hello-world.@js"),
          false
        )
      )
    ).toBe(5);
  });
});
