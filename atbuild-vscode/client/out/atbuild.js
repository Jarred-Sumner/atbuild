"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.AtBuild = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const vm = require("vm");

const path = require("path");

const fs = require("fs");

const BUILD_TIME_MATCHER = /^\s*@(.*)/;
const RUNTIME_MATCHER = /\@\{([^@}]*)\}/gm;
const HEADER_STRING = "/* eslint-disable */" + "\n" + "// @ts-nocheck" + "\n" + "// @ts-ignore\n" + "// @noflow\n" + '"use strict";\n\n';
let context, contextOpts;

const getMaxLine = function (currentLine, node) {
  return Math.max(currentLine, node.lineNumber);
};

class AtBuild {
  static buildAST(code) {
    const nodes = [];
    let lineMatch = null;
    let lines = String(code).split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().length === 0) {
        continue;
      }

      if (lineMatch = lines[i].match(BUILD_TIME_MATCHER)) {
        let scopeValue = 0;

        if (lineMatch[1].trimEnd().endsWith("{")) {
          scopeValue++;
        } else if (lineMatch[1].trimEnd().endsWith("{")) {
          scopeValue--;
        }

        nodes.push({
          lineNumber: i,
          type: "BuildtimeCode",
          value: lineMatch[1],
          scope: scopeValue
        });
      } else {
        let line = [{
          lineNumber: i,
          type: "RuntimecodeLineStart"
        }, {
          lineNumber: i,
          type: "RuntimeCode",
          value: lines[i],
          column: 0
        }];
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
            column: index - offset
          };
          lineToMatch = result.input.substring(offset = index + input.length);
          line[line.length - 1] = {
            type: "RuntimeCode",
            lineNumber: i,
            value: lineToMatch,
            column: offset
          };
        }

        nodes.push(...line);
        nodes.push({
          lineNumber: i,
          type: "RuntimecodeLineEnd"
        });
      }
    }

    return nodes;
  }

  static transformASTBuildTimeOnly(nodes) {
    const maxLineNumber = nodes.reduce(getMaxLine, 0);
    let lines = new Array(maxLineNumber);

    for (let i = 0; i < lines.length; i++) {
      lines[i] = "";
    }

    for (let node of nodes) {
      switch (node.type) {
        case "BuildtimeCode":
          {
            lines[node.lineNumber] += node.value + "\n";
            break;
          }

        case "InterpolatedCode":
          {
            lines[node.lineNumber] += "${" + node.value + "}";
            break;
          }

        case "RuntimeCode":
          {
            lines[node.lineNumber] += node.value.replace(/.*/gim, " ");
            break;
          }

        case "RuntimecodeLineStart":
          {
            lines[node.lineNumber] += "`";
            break;
          }

        case "RuntimecodeLineEnd":
          {
            lines[node.lineNumber] += "`\n";
            break;
          }
      }
    }

    return lines.join("\n");
  }

  static transformAST(nodes) {
    let code = "var __CODE__ = [];\n\n";
    const maxLineNumber = nodes.reduce(getMaxLine, 0);
    let lines = new Array(maxLineNumber + 3);

    for (let i = 0; i < lines.length; i++) {
      lines[i] = "";
    }

    for (let node of nodes) {
      switch (node.type) {
        case "BuildtimeCode":
          {
            lines[node.lineNumber] += node.value + "\n";
            break;
          }

        case "InterpolatedCode":
          {
            lines[node.lineNumber] += "${" + node.value + "}";
            break;
          }

        case "RuntimeCode":
          {
            lines[node.lineNumber] += node.value;
            break;
          }

        case "RuntimecodeLineStart":
          {
            lines[node.lineNumber] += "__CODE__.push(`";
            break;
          }

        case "RuntimecodeLineEnd":
          {
            lines[node.lineNumber] += "`);\n";
            break;
          }
      }
    }

    lines.unshift(code);
    lines[lines.length - 1] = `module.exports = __CODE__.join("\\n");`;
    return lines.join("\n");
  }

  static *findNodesAtLine(nodes, lineNumber) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.lineNumber === lineNumber) {
        yield node;
      }
    }
  }

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

    if (lineNode.type === "BuildtimeCode" || lineNode.type === "InterpolatedCode") {
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

    for (let node of nodes) {
      switch (node.type) {
        case "BuildtimeCode":
          {
            lines[node.lineNumber] += node.value + "\n";
            break;
          }

        case "InterpolatedCode":
          {
            lines[node.lineNumber] += "${" + node.value + "}";
            break;
          }

        case "RuntimeCode":
          {
            lines[node.lineNumber] += `/* ATBuildColumnMap: ${node.column} */` + node.value;
            break;
          }

        case "RuntimecodeLineStart":
          {
            lines[node.lineNumber] += `__CODE__.push(\`/* ATBuildLineMap: ${node.lineNumber} */`;
            break;
          }

        case "RuntimecodeLineEnd":
          {
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

    if (response[0] !== "" && response[1] === this.ASTResponseType.RuntimeCode) {
      const source = this.eval(response[0], filepath, false);
      response[0] = source;
      const lines = source.split("\n");

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(`/* AtBuildLineMap: ${line} */`)) {
          response[2] = i + 1;
          response[3] = lines[i].indexOf(`/* AtBuildColumnMap: ${column} */`) + `/* AtBuildColumnMap: ${column} */`.length + `/* AtBuildLineMap: ${line} */`;
          break;
        }
      }
    }
  }

  static evalFile(path, header) {
    return this.eval(fs.readFileSync(path), path, header);
  }

  static eval(code, filepath = null, addHeader = false, requireFunc = module.require, consoleObj = console) {
    const ast = AtBuild.buildAST(code);
    const processed = AtBuild.transformAST(ast);

    if (!context) {
      context = new vm.createContext({
        __filename: null,
        __dirname: null,
        exports: exports,
        require: require,
        module: {
          exports: null
        }
      }, {
        name: "AtBuild Source"
      });
    }

    if (!contextOpts) {
      contextOpts = {
        displayErrors: true,
        lineOffset: -3,
        filename: "atbuild.js"
      };
    }

    if (filepath) {
      const parts = path.parse(filepath);
      context.__dirname = parts.dir;
      context.__filename = parts.base;
      contextOpts.filename = filepath;
    }

    context.require = requireFunc;
    context.console = consoleObj;
    vm.runInContext(processed, context, contextOpts);
    /* ^--- Look Above This Line ---^ */

    let source = context.module.exports;

    if (addHeader) {
      source = HEADER_STRING + source;
    }

    context.module.exports = null;
    return source;
  }

}

exports.AtBuild = AtBuild;

_defineProperty(AtBuild, "ASTResponseType", {
  BuildtimeCode: 0,
  RuntimeCode: 1
});

var _default = AtBuild;
exports.default = _default;