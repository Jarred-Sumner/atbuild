const vm = require("vm");
const path = require("path");
const fs = require("fs");
const BUILD_TIME_MATCHER = /^\s*@(.*)/;
const RUNTIME_MATCHER = /\@\{([^@}]*)\}/gm;

const HEADER_STRING =
  "/* eslint-disable */" +
  "\n" +
  "// @ts-nocheck" +
  "\n" +
  "// @ts-ignore\n" +
  "// @noflow\n" +
  '"use strict";\n\n';

let context, contextOpts;

const getMaxLine = function (currentLine, node) {
  return Math.max(currentLine, node.lineNumber);
};

export class AtBuild {
  static buildAST(code) {
    const nodes = [];
    let lineMatch = null;
    let lines = String(code).split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().length === 0) {
        continue;
      }

      if ((lineMatch = lines[i].match(BUILD_TIME_MATCHER))) {
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
          };

          lineToMatch = result.input.substring((offset = index + input.length));

          line[line.length - 1] = {
            type: "RuntimeCode",
            lineNumber: i,
            value: lineToMatch,
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

  static transformAST(nodes) {
    let code = "var __CODE__ = [];\n\n";
    const maxLineNumber = nodes.reduce(getMaxLine, 0);
    let lines = new Array(maxLineNumber + 3);
    for (let i = 0; i < lines.length; i++) {
      lines[i] = "";
    }

    for (let node of nodes) {
      switch (node.type) {
        case "BuildtimeCode": {
          lines[node.lineNumber] += node.value + "\n";
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

    lines[lines.length - 1] = `module.exports = __CODE__.join("\\n");`;
    return lines.join("\n");
  }

  static evalFile(path, header) {
    return this.eval(fs.readFileSync(path), path, header);
  }

  static eval(code, filepath = null, addHeader = false) {
    const ast = AtBuild.buildAST(code);
    const processed = AtBuild.transformAST(ast);
    if (!context) {
      context = new vm.createContext(
        {
          __filename: null,
          __dirname: null,
          exports: exports,
          require: require,
          module: { exports: null },
        },
        { name: "AtBuild Source" }
      );
    }

    if (!contextOpts) {
      contextOpts = {
        displayErrors: true,
        lineOffset: -3,
        filename: "atbuild.js",
      };
    }

    if (filepath) {
      const parts = path.parse(filepath);
      context.__dirname = parts.dir;
      context.__filename = parts.base;
      contextOpts.filename = filepath;
    }

    vm.runInContext(
      processed,
      context,
      contextOpts
    ); /* ^--- Look Above This Line ---^ */

    let source = context.module.exports;
    if (addHeader) {
      source = HEADER_STRING + source;
    }

    context.module.exports = null;
    return source;
  }
}
