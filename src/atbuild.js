const vm = require("vm");
const BUILD_TIME_MATCHER = /^\s*@(.*)/;
const RUNTIME_MATCHER = /\@\{(.*)\}/g;

const context = new vm.createContext({
  module: { exports: null },
});

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

        for (let result of lines[i].matchAll(RUNTIME_MATCHER)) {
          const [input, match] = result;
          const index = result.index;

          const original = line[line.length - 1].value;
          line[line.length - 1].value = original.substring(0, index);

          line.length += 2;

          line[line.length - 2] = {
            lineNumber: i,
            type: "InterpolatedCode",
            value: match,
          };

          line[line.length - 1] = {
            type: "RuntimeCode",
            lineNumber: i,
            value: original.substring(index + input.length + 1),
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
    let code = "const __CODE__ = [];\n\n";
    const maxLineNumber = nodes.reduce(getMaxLine, 0);
    let lines = new Array(maxLineNumber + 2);
    for (let i = 0; i < lines.length; i++) {
      lines[i] = "";
    }
    let scope = 0,
      lineMatch = null,
      currentLine = 0;
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

  static eval(code) {
    const ast = AtBuild.buildAST(code);
    const processed = AtBuild.transformAST(ast);
    console.log(processed);
    context.module.exports = null;
    vm.runInContext(processed, context);
    return context.module.exports;
  }
}
