const BUILD_TIME_MATCHER = /^\s*@(.*)/;
const MULTILINE_BUILD_TIME_MATCHER = /^\s*@@(.*)/;
const RUNTIME_MATCHER = /\@\{([^@}]*)\}/gm;
const EXPORT_FUNCTION_LINE_START = /^\s*@lib function\s*\$*(\w*)\((.*)\)\s*\{?$/;
const EXPORT_FUNCTION_LINE_END = /\s*@lib-\s*$/;

export enum ASTNode {
  RuntimeCode = 0,
  BuildtimeCode = 1,
  MultilineBuildtimeCode = 2,
  RuntimecodeLineStart = 3,
  InterpolatedCode = 4,
  RuntimecodeLineEnd = 5,
  ExportFunctionStart = 6,
  ExportFunctionEnd = 7,
}

export function buildAST(code: string) {
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
        type: ASTNode.MultilineBuildtimeCode,
        value: string,
        scope: scopeValue,
      });
    } else if (isMultiline) {
      nodes.push({
        lineNumber: i,
        type: ASTNode.MultilineBuildtimeCode,
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
        type: ASTNode.BuildtimeCode,
        value: string,
        scope: scopeValue,
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
        type: ASTNode.BuildtimeCode,
        value: string,
        scope: scopeValue,
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
        type: ASTNode.BuildtimeCode,
        value: string,
        scope: scopeValue,
      });
    } else {
      let line = [
        {
          lineNumber: i,
          type: ASTNode.RuntimecodeLineStart,
        },
        {
          lineNumber: i,
          type: ASTNode.RuntimeCode,
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
          type: ASTNode.InterpolatedCode,
          value: match,
          column: index - offset,
        };

        lineToMatch = result.input.substring((offset = index + input.length));

        line[line.length - 1] = {
          type: ASTNode.RuntimeCode,
          lineNumber: i,
          value: lineToMatch,
          column: offset,
        };
      }

      nodes.push(...line);

      nodes.push({
        lineNumber: i,
        type: ASTNode.RuntimecodeLineEnd,
      });
    }
  }

  return nodes;
}

export function transformAST(nodes, asFunction, exposeFunctions = false) {
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
      case ASTNode.MultilineBuildtimeCode:
      case ASTNode.BuildtimeCode: {
        lines[node.lineNumber] += node.value + "\n";
        break;
      }

      case ASTNode.InterpolatedCode: {
        lines[node.lineNumber] += "${" + node.value + "}";
        break;
      }
      case ASTNode.RuntimeCode: {
        // prettier-ignore
        lines[node.lineNumber] += node.value.replace(/`/igm, "\\`")
        break;
      }

      case ASTNode.RuntimecodeLineStart: {
        lines[node.lineNumber] += "__CODE__.push(`";
        break;
      }

      case ASTNode.RuntimecodeLineEnd: {
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
    lines[lines.length - 1] = `module.exports.default =  __CODE__.join("\\n");`;
  }

  return lines.join("");
}
