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

  static transformASTBuildTimeOnly(nodes) {
    const maxLineNumber = nodes.reduce(getMaxLine, 0);
    let lines = new Array(maxLineNumber + 1);

    for (let i = 0; i < lines.length; i++) {
      lines[i] = "";
    }

    for (let node of nodes) {
      switch (node.type) {
        case "BuildtimeCode": {
          lines[node.lineNumber] += node.value;
          if (!lines[node.lineNumber].endsWith("\n")) {
            lines[node.lineNumber] += "\n";
          }
          break;
        }

        case "InterpolatedCode": {
          lines[node.lineNumber] += "${" + node.value + "}";
          break;
        }

        case "RuntimeCode": {
          lines[node.lineNumber] += node.value;
          break;
        }

        case "RuntimecodeLineStart": {
          lines[node.lineNumber] += "`";
          break;
        }

        case "RuntimecodeLineEnd": {
          lines[node.lineNumber] += "`;\n";
          break;
        }
      }
    }

    return lines.join("");
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

  static transformASTForLineColumn(nodes, lineNumber, column, response) {
    // go to the line.
    let lineNode = this.findNodesAtLine(nodes, lineNumber).next().value;

    if (!lineNode) {
      response[0] = "";
      response[1] = this.ASTResponseType.RuntimeCode;
      response[2] = lineNumber;
      response[3] = column;
      return;
    }

    if (
      lineNode.type === "BuildtimeCode" ||
      lineNode.type === "InterpolatedCode"
    ) {
      response[0] = this.transformASTBuildTimeOnly(nodes);
      response[1] = this.ASTResponseType.BuildtimeCode;
      response[2] = lineNumber;
      response[3] = column;
      return;
    }

    let code = "var __CODE__ = [];\n\n";
    const maxLineNumber = nodes.reduce(getMaxLine, 0);
    let lines = new Array(maxLineNumber + 3);
    for (let i = 0; i < lines.length; i++) {
      lines[i] = "";
    }

    let lineOffset = 0;
    for (let node of nodes) {
      switch (node.type) {
        case "BuildtimeCode": {
          lines[node.lineNumber] += node.value + "\n";
          lineOffset++;
          break;
        }

        case "InterpolatedCode": {
          lines[node.lineNumber] += "${" + node.value + "}";
          break;
        }
        case "RuntimeCode": {
          lines[node.lineNumber] +=
            `/* ATBuildColumnMap: ${node.column} */` + node.value;
          break;
        }

        case "RuntimecodeLineStart": {
          lines[
            node.lineNumber
          ] += `__CODE__.push(\`/* ATBuildLineMap: ${node.lineNumber} */`;
          break;
        }

        case "RuntimecodeLineEnd": {
          lines[node.lineNumber] += "`);\n";
          break;
        }
      }
    }

    lines.unshift(code);

    lines[lines.length - 1] = `module.exports = __CODE__.join("\\n");`;
    response[0] = lines.join("\n");
    response[1] = this.ASTResponseType.RuntimeCode;
    response[2] = lineNumber;
    response[3] = column;
    return;
  }

  static extractSourceAndType(code, filepath, line, column, response) {
    const ast = AtBuild.buildAST(code);
    response[2] = response[3] = 0;
    AtBuild.transformASTForLineColumn(ast, line, column, response);

    if (
      response[0] !== "" &&
      response[1] === this.ASTResponseType.RuntimeCode
    ) {
      const source = this._eval(response[0], filepath, false);

      const lines = source.split("\n");

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(`/* AtBuildLineMap: ${line} */`) > -1) {
          response[2] = i;
          for (let offset = 0; offset < lines[i]; offset++) {
            const line = lines[i].substring(offset);
            let _offset = line.indexOf(`/* AtBuildColumnMap: ${column} */`);
            let match = null;
            if (_offset > -1) {
              response[3] = offset + _offset;
              break;
            } else if (
              (match = line.match(/\/\* AtBuildColumnMap: (\d*) \*\//))
            ) {
            }
          }
          response[3] = lines[i].indexOf(`/* AtBuildColumnMap: ${column} */`);
          break;
        }
      }

      response[0] = source
        .replace(/\/\* AtBuildColumnMap: \d* \*\//gim, "")
        .replace(/\/\* AtBuildLineMap: \d* \*\//gim, "");
    }
  }

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
      source += `
        module.exports = __atBuild
      `;
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
    const processed = AtBuild.transformAST(ast, false);
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
    const processed = AtBuild.transformAST(ast, true);

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
