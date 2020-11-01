let fs;
const BUILD_TIME_MATCHER = /^\s*@(.*)/;
const MULTILINE_BUILD_TIME_MATCHER = /^\s*@@(.*)/;
const RUNTIME_MATCHER = /\@\{([^@}]*)\}/gm;

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
    const nodes = [];
    let lineMatch = null;
    let lines = String(code).split("\n");
    let isMultiline = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().length === 0) {
        continue;
      }

      if ((lineMatch = lines[i].match(MULTILINE_BUILD_TIME_MATCHER))) {
        if (isMultiline) {
          isMultiline = false;
        } else {
          isMultiline = true;
        }
        let scopeValue = 0;

        if (lineMatch[1].trimEnd().endsWith("{")) {
          scopeValue++;
        } else if (lineMatch[1].trimEnd().endsWith("{")) {
          scopeValue--;
        }
        let string = lineMatch[1];
        for (let i = 0; i < lineMatch[0].indexOf(lineMatch[1]) + 1; i++) {
          string = " " + string;
        }

        nodes.push({
          lineNumber: i,
          type: "MultilineBuildtimeCode",
          value: string,
          scope: scopeValue,
        });
      } else if (isMultiline) {
        nodes.push({
          lineNumber: i,
          type: "MultilineBuildtimeCode",
          value: lines[i],
          // scope: scopeValue,
        });
      } else if ((lineMatch = lines[i].match(BUILD_TIME_MATCHER))) {
        let scopeValue = 0;

        if (lineMatch[1].trimEnd().endsWith("{")) {
          scopeValue++;
        } else if (lineMatch[1].trimEnd().endsWith("{")) {
          scopeValue--;
        }
        let string = lineMatch[1];
        for (let i = 0; i < lineMatch[0].indexOf(lineMatch[1]) + 1; i++) {
          string = " " + string;
        }

        nodes.push({
          lineNumber: i,
          type: "BuildtimeCode",
          value: string,
          scope: scopeValue,
        });
      } else {
        let line = [
          {
            lineNumber: i,
            type: "RuntimecodeLineStart",
          },
          {
            lineNumber: i,
            type: "RuntimeCode",
            value: lines[i],
            column: 0,
          },
        ];

        let result;
        let lineToMatch = lines[i];
        let offset = 0;

        for (let result of lineToMatch.matchAll(RUNTIME_MATCHER)) {
          const [input, match] = result;
          const index = result.index;

          const original = line[line.length - 1].value;
          line[line.length - 1].value = original.substring(0, index - offset);

          line.length += 2;

          line[line.length - 2] = {
            lineNumber: i,
            type: "InterpolatedCode",
            value: match,
            column: index - offset,
          };

          lineToMatch = result.input.substring((offset = index + input.length));

          line[line.length - 1] = {
            type: "RuntimeCode",
            lineNumber: i,
            value: lineToMatch,
            column: offset,
          };
        }

        nodes.push(...line);

        nodes.push({
          lineNumber: i,
          type: "RuntimecodeLineEnd",
        });
      }
    }

    return nodes;
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

  static transformAST(nodes, asFunction, exposeFunctions = false) {
    let code;
    if (asFunction) {
      code =
        "module.exports.default = async function __atBuild(require) {  var __CODE__ = [];\n\n";
    } else {
      code = "var __CODE__ = [];\n\n";
    }
    const maxLineNumber = nodes.reduce(getMaxLine, 0);
    let lines = new Array(maxLineNumber + 3 + (exposeFunctions | 0));
    for (let i = 0; i < lines.length; i++) {
      lines[i] = "";
    }

    for (let node of nodes) {
      switch (node.type) {
        case "MultilineBuildtimeCode":
        case "BuildtimeCode": {
          lines[node.lineNumber] += node.value + "\n";
          break;
        }

        case "InterpolatedCode": {
          lines[node.lineNumber] += "${" + node.value + "}";
          break;
        }
        case "RuntimeCode": {
          // prettier-ignore
          lines[node.lineNumber] += node.value.replace(/`/igm, "\\`")
          break;
        }

        case "RuntimecodeLineStart": {
          lines[node.lineNumber] += "__CODE__.push(`";
          break;
        }

        case "RuntimecodeLineEnd": {
          lines[node.lineNumber] += "`);\n";
          break;
        }
      }
    }
    lines.unshift(code);

    if (exposeFunctions) {
      lines[
        lines.length - 2
      ] = `for (let key of Object.keys(module.exports)) { module.exports["$" + key] = module.exports[key]; }\n`;
    }

    if (asFunction) {
      lines[
        lines.length - 1
      ] = `return __CODE__.join("\\n");\n}; module.exports.__specialInitFunction = true;`;
    } else {
      lines[
        lines.length - 1
      ] = `module.exports.default =  __CODE__.join("\\n");`;
    }

    return lines.join("");
  }

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
    filepath = null,
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
    code,
    filepath = null,
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
    code,
    filepath = null,
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

export default AtBuild;

export function $() {}
