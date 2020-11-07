import { buildAST, transformAST } from "./fullAst";

let fs;

const HEADER_STRING =
  "/* eslint-disable */" +
  "\n" +
  "// @ts-nocheck" +
  "\n" +
  "// @ts-ignore\n" +
  "// @noflow\n" +
  '"use strict";\n\n';

const getMaxLine = function (currentLine, node) {
  return Math.max(currentLine, node.lineNumber);
};

export let requireFromString;

let bundle;

if (process.env.WEB) {
  requireFromString = (code) =>
    eval(
      `
  () => {
    var exports = {default: null};
` +
        code.replace("module.exports", "exports") +
        `
  }()
`
    );
} else {
  requireFromString = require("./requireFromString").requireFromString;
  fs = require("fs");
}

export class AtBuild {
  static buildAST(code) {
    return buildAST(code);
  }

  static transformAST = transformAST;

  static *findNodesAtLine(nodes, lineNumber) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.lineNumber === lineNumber) {
        yield node;
      }
    }
  }

  static ASTResponseType = {
    BuildtimeCode: 0,
    RuntimeCode: 1,
  };

  static evalFile(path, header) {
    return this.eval(fs.readFileSync(path), path, header, module.parent);
  }

  static async evalFileAsync(path, header) {
    return await this.evalAsync(
      fs.readFileSync(path),
      path,
      header,
      module.parent
    );
  }

  static _eval(
    code,
    filepath: string = null,
    addHeader = false,
    requireFunc = module.require
  ) {
    let source = requireFromString(code, filepath, requireFunc);
    if (addHeader) {
      source = HEADER_STRING + source;
    }

    return source;
  }

  static eval(
    code: string,
    filepath: string = null,
    addHeader = false,
    requireFunc = module.require
  ) {
    const ast = AtBuild.buildAST(code);
    const processed = AtBuild.transformAST(ast, code);
    const res = this._eval(processed, filepath, addHeader, requireFunc);
    if (res && res.default) {
      return res.default;
    } else {
      return res;
    }
  }

  static async evalAsync(
    code: string,
    filepath: string = null,
    addHeader = false,
    requireFunc = module.require
  ) {
    const ast = AtBuild.buildAST(code);
    const processed = AtBuild.transformAST(ast, code);

    let source = await requireFromString(processed, filepath, requireFunc);
    if (addHeader) {
      source = HEADER_STRING + source;
    }

    return source;
  }
}

export default function $(arg: any) {
  return arg;
}

export { buildAST, transformAST };
