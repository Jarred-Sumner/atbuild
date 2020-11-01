const RUNTIME_MATCHER = /(^|\W|"|'|;)(\$\w*)*\(((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\))/g;
const BUILD_TIME_LINE_MATCHER = /\/\/\s*\$\s*(ATBUILD)?/;
const MULTILINE_BUILD_TIME_MATCHER = /^\s*\/\/\s*((\$\$)|(ATBUILD))\s*?/;

const RUNTIME_MATCHER_TEST_ONLY = new RegExp(RUNTIME_MATCHER);
const BUILD_TIME_LINE_MATCHER_TEST_ONLY = new RegExp(BUILD_TIME_LINE_MATCHER);
const MULTILINE_BUILD_TIME_MATCHER_TEST_ONLY = new RegExp(
  MULTILINE_BUILD_TIME_MATCHER
);

export enum ASTNodeType {
  runtimeLineStart = 0,
  runtimeLineEnd = 1,
  buildTimeCode = 2,
  runtimeCode = 3,
  buildTimeLine = 4,
  multilineBuildTimeLine = 5,
  runtimeLine = 6,
}

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
  buildNodeCount = 0;
  runtimeLineCount = 0;
  maxLine = 0;
}

let lineNodes: ASTNode[] = [];

export function quickTest(source: string) {
  return (
    source.includes("$") &&
    (RUNTIME_MATCHER_TEST_ONLY.test(source) ||
      BUILD_TIME_LINE_MATCHER_TEST_ONLY.test(source) ||
      MULTILINE_BUILD_TIME_MATCHER_TEST_ONLY.test(source))
  );
}

export function buildAST(source: string) {
  const nodes = new ASTNodeList();

  let lines = String(source).split("\n");
  let isMultiline = false,
    result = null,
    lineToMatch = null,
    offset = 0,
    funcArgs = "",
    interpolatedCodeNode: ASTNode,
    runtimeLineStartNode: ASTNode = null,
    index = 0,
    runtimeCodeNode: ASTNode = null,
    runtimeCodeLineEndNode: ASTNode = null,
    remainderRunTimeCodeNode: ASTNode = null,
    runtimeLine: ASTNode = null,
    hasBuildTimeNode = false,
    node: ASTNode = astNodeBase;
  let i = 0;
  for (i = 0; i < lines.length; i++) {
    if (lines[i].trim().length === 0) {
      continue;
    }

    if (MULTILINE_BUILD_TIME_MATCHER_TEST_ONLY.test(lines[i])) {
      if (isMultiline) {
        isMultiline = false;
      } else {
        isMultiline = true;
      }

      node = Object.create(astNodeBase);

      node.type = ASTNodeType.multilineBuildTimeLine;
      node.value = lines[i];
      node.line = i;

      nodes.push(node);
      nodes.buildNodeCount++;
    } else if (isMultiline) {
      node = Object.create(astNodeBase);

      node.type = ASTNodeType.multilineBuildTimeLine;
      nodes.buildNodeCount++;
      node.value = lines[i];
      node.line = i;

      nodes.push(node);
    } else if (BUILD_TIME_LINE_MATCHER_TEST_ONLY.test(lines[i])) {
      node = Object.create(astNodeBase);

      node.type = ASTNodeType.buildTimeLine;
      nodes.buildNodeCount++;
      node.value = lines[i];
      node.line = i;
      nodes.push(node);
    } else {
      hasBuildTimeNode = false;
      runtimeLineStartNode = Object.create(astNodeBase);
      runtimeCodeNode = Object.create(astNodeBase);
      runtimeCodeLineEndNode = Object.create(astNodeBase);

      runtimeLineStartNode.line = runtimeCodeNode.line = runtimeCodeLineEndNode.line = i;
      runtimeLineStartNode.type = ASTNodeType.runtimeLineStart;
      runtimeCodeLineEndNode.type = ASTNodeType.runtimeLineEnd;
      runtimeCodeNode.type = ASTNodeType.runtimeCode;

      runtimeCodeNode.value = lines[i];

      lineNodes = [runtimeCodeNode];

      lineToMatch = lines[i];
      offset = 0;
      nodes.runtimeLineCount++;

      let runtimeRegexer = new RegExp(RUNTIME_MATCHER);

      for (let result of lineToMatch.matchAll(
        // If we move this Regex to the top...it stops working sometimes.
        runtimeRegexer
      )) {
        const [
          input,
          linePrefix,
          functionCall,
          functionArguments,
          suffix,
        ] = result;
        index = result.index;

        lineNodes[lineNodes.length - 1].value =
          lineNodes[lineNodes.length - 1].value.substring(0, index - offset) +
          linePrefix;

        lineNodes.length += 2;
        hasBuildTimeNode = true;

        remainderRunTimeCodeNode = Object.create(astNodeBase);
        interpolatedCodeNode = Object.create(astNodeBase);
        remainderRunTimeCodeNode.line = interpolatedCodeNode.line = i;
        interpolatedCodeNode.type = ASTNodeType.buildTimeCode;

        // prettier-ignore
        funcArgs = (functionArguments || "")

        interpolatedCodeNode.value =
          `${
            functionCall === "$"
              ? "module.namespaceCollisionHack"
              : functionCall
          }(` + funcArgs;

        lineNodes[lineNodes.length - 2] = interpolatedCodeNode;
        nodes.buildNodeCount++;

        lineToMatch = result.input.substring((offset = index + input.length));

        remainderRunTimeCodeNode.value = lineToMatch;
        remainderRunTimeCodeNode.type = ASTNodeType.runtimeCode;
        lineNodes[lineNodes.length - 1] = remainderRunTimeCodeNode;
      }

      if (!hasBuildTimeNode) {
        runtimeLine = Object.create(astNodeBase);
        runtimeLine.line = i;
        runtimeLine.value = lines[i];
        runtimeLine.type = ASTNodeType.runtimeLine;
        nodes.push(runtimeLine);
      } else {
        nodes.push(runtimeLineStartNode, ...lineNodes, runtimeCodeLineEndNode);
      }
    }
  }
  nodes.maxLine = i;
  return nodes;
}

export function transformAST(nodes: ASTNodeList) {
  let code = "var __CODE__ = [];\n\n";
  const maxLineNumber = nodes.maxLine;
  let lines = new Array(maxLineNumber + 3);
  lines.fill("");

  for (let node of nodes) {
    switch (node.type) {
      case ASTNodeType.buildTimeLine:
        lines[node.line] += node.value + "\n";
      case ASTNodeType.multilineBuildTimeLine: {
        lines[node.line] += node.value + "\n\n";
        break;
      }

      case ASTNodeType.buildTimeCode: {
        lines[node.line] += "${" + node.value + "}";
        break;
      }
      case ASTNodeType.runtimeCode: {
        // prettier-ignore
        lines[node.line] += node.value
        break;
      }

      case ASTNodeType.runtimeLineStart: {
        lines[node.line] += "__CODE__.push(`";
        break;
      }

      case ASTNodeType.runtimeLineEnd: {
        lines[node.line] += "`);\n\n";
        break;
      }
      case ASTNodeType.runtimeLine: {
        lines[node.line] += "__CODE__.push(`" + node.value + "`);\n\n";
        break;
      }
    }
  }
  lines.unshift(code);

  lines[lines.length - 1] = `module.exports.default = __CODE__.join("");`;

  return lines.join("");
}

export function transform(source: string) {
  const nodes = buildAST(source);

  if (nodes.buildNodeCount > 0) {
    return transformAST(nodes);
  } else {
    return null;
  }
}
