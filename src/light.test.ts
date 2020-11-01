import { quickTest, transform } from "./light";

describe("ATBuild Light", () => {
  it("returns null for regular source code", function () {
    const code = `
    export type ASTNode = {
      type: ASTNodeType;
      value: string;
      line: number;
    };

    const astNodeBase: ASTNode = {
      type: ASTNodeType.buildTimeCode,
      value: "",
      line: 0,
    };

    export class ASTNodeList extends Array<ASTNode> {
      buildLineCount = 0;
      runtimeLineCount = 0;
      maxLine = 0;
    }

    let typings = null,
  tsconfig = null,
  enableTypings = false;


  callback(null, code, {
    version: "3",
    sources: [resourcePath],
    file: resourcePath,
    sourcesContent: [],
    mappings: "",
  });

  if (process.env.WRITE_ATBUILD_TO_DISK) {
    fs.promises.writeFile(
      resourcePath.replace(
        path.extname(resourcePath),
        typings ? ".out.ts" : "out.js"
      ),
      code
    );
  }

    `;
    expect(transform(code)).toBe(null);
    expect(quickTest(code)).toBe(false);
  });

  it("works with interpolated function calls", () => {
    let code = `
    const format = $dateFormatter("HH:MM:SS")
  `;
    const result = transform(code);
    expect(result).toContain('const format = ${$dateFormatter("HH:MM:SS")}');
    expect(quickTest(code)).toBe(true);
  });

  it("works with interpolated function calls that have no arguments", () => {
    let code = `
    const format = $dateFormatter()
  `;
    let result = transform(code);
    expect(result).toContain("const format = ${$dateFormatter()}");
    expect(quickTest(code)).toBe(true);
  });

  it("works with quoted interpolated function calls that have no arguments", () => {
    let code = `

    const format = "$GetPackageJson()";

    `;

    let result = transform(code);
    expect(result).toContain('const format = "${$GetPackageJson()}"');
    expect(quickTest(code)).toBe(true);
  });

  it("works with build-time only lines", () => {
    const code = `
    // This should be a buildtime-only line
    import {$dateFormatter} from 'atbuild-date'; // $

    // This should be normal string
    console.log("HI!");
  `;
    const result = transform(code);
    const lines = result.split("\n");
    const line = lines.find((l) => l.includes("import {$dateFormatter}"));

    expect(line).toBeTruthy();
    expect(line).not.toContain(".push");
    expect(quickTest(code)).toBe(true);
  });

  it("works with build-time only lines and interpolated function calls", () => {
    const code = `
    // This should be a buildtime-only line
    import {$dateFormatter} from 'atbuild-date'; // $

    // This should be normal string
    export const hourFormatter = $dateFormatter("HH:MM:SS")

  `;
    const result = transform(code);
    expect(quickTest(code)).toBe(true);

    const lines = result.split("\n");
    const buildLine = lines.find((l) => l.includes("import {$dateFormatter}"));

    expect(buildLine).toBeTruthy();
    expect(buildLine).not.toContain(".push");

    const runtimeLine = lines.find((l) =>
      l.includes("export const hourFormatter =")
    );

    expect(runtimeLine).toBeTruthy();
    expect(runtimeLine).toContain(".push");
  });

  it("works with multiline build-time only lines and interpolated function calls", () => {
    const code = `
    // This should be a buildtime-only line
    import {$dateFormatter} from 'atbuild-date'; // $

    // $$

    const baconMan = 20;
    const iDontGetTieshunsJokeInToadChat = true;
    const whoisjaSON = true;

    // $$

    // This should be normal string
    export const hourFormatter = $dateFormatter("HH:MM:SS")

    // $$

    const ok = true;

    // $$

  `;
    const result = transform(code);
    const lines = result.split("\n");
    const buildLine = lines.find((l) => l.includes("import {$dateFormatter}"));
    const baconLine = lines.find((l) => l.includes("const baconMan = 20;"));
    const whoisjaSON = lines.find((l) =>
      l.includes("const whoisjaSON = true;")
    );

    expect(buildLine).toBeTruthy();
    expect(buildLine).not.toContain(".push");

    expect(baconLine).toBeTruthy();
    expect(baconLine).not.toContain(".push");

    expect(whoisjaSON).toBeTruthy();
    expect(whoisjaSON).not.toContain(".push");

    const runtimeLine = lines.find((l) =>
      l.includes("export const hourFormatter =")
    );

    expect(runtimeLine).toBeTruthy();
    expect(runtimeLine).toContain(".push");
    expect(quickTest(code)).toBeTruthy();
  });
});
