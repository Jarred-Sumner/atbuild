import { AtBuild } from "./atbuild";

describe("AtBuild", function () {
  it("parses build-time code", function () {
    const first = `
    @for (lst i = 0; i < 10; i++) {
      console.log("@{i}Hello World @{i}");
    @}
`;
    console.log(AtBuild.eval(first));
  });
});
