// src/light.ts
const RUNTIME_MATCHER = /(^|\W|"|'|;)(\$\w*)*\(((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\))/g;
const BUILD_TIME_LINE_MATCHER = /\/\/\s*\$\s*(ATBUILD)?/;
const MULTILINE_BUILD_TIME_MATCHER = /^\s*\/\/\s*((\$\$)|(ATBUILD))\s*?/;
const RUNTIME_MATCHER_TEST_ONLY = new RegExp(RUNTIME_MATCHER);
const BUILD_TIME_LINE_MATCHER_TEST_ONLY = new RegExp(BUILD_TIME_LINE_MATCHER);
const MULTILINE_BUILD_TIME_MATCHER_TEST_ONLY = new RegExp(MULTILINE_BUILD_TIME_MATCHER);
var ASTNodeType;
(function(ASTNodeType2) {
  ASTNodeType2[ASTNodeType2["runtimeLineStart"] = 0] = "runtimeLineStart";
  ASTNodeType2[ASTNodeType2["runtimeLineEnd"] = 1] = "runtimeLineEnd";
  ASTNodeType2[ASTNodeType2["buildTimeCode"] = 2] = "buildTimeCode";
  ASTNodeType2[ASTNodeType2["runtimeCode"] = 3] = "runtimeCode";
  ASTNodeType2[ASTNodeType2["buildTimeLine"] = 4] = "buildTimeLine";
  ASTNodeType2[ASTNodeType2["multilineBuildTimeLine"] = 5] = "multilineBuildTimeLine";
  ASTNodeType2[ASTNodeType2["runtimeLine"] = 6] = "runtimeLine";
})(ASTNodeType || (ASTNodeType = {}));
const astNodeBase = {
  type: 2,
  value: "",
  line: 0
};
class ASTNodeList extends Array {
  constructor() {
    super(...arguments);
    this.buildNodeCount = 0;
    this.runtimeLineCount = 0;
    this.maxLine = 0;
  }
}
let lineNodes = [];
function quickTest(source) {
  return source.includes("$") && (RUNTIME_MATCHER_TEST_ONLY.test(source) || BUILD_TIME_LINE_MATCHER_TEST_ONLY.test(source) || MULTILINE_BUILD_TIME_MATCHER_TEST_ONLY.test(source));
}
function buildAST(source) {
  const nodes = new ASTNodeList();
  let lines = String(source).split("\n");
  let isMultiline = false, result = null, lineToMatch = null, offset = 0, funcArgs = "", interpolatedCodeNode, runtimeLineStartNode = null, index = 0, runtimeCodeNode = null, runtimeCodeLineEndNode = null, remainderRunTimeCodeNode = null, runtimeLine = null, hasBuildTimeNode = false, node = astNodeBase;
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
      node.type = 5;
      node.value = lines[i];
      node.line = i;
      nodes.push(node);
      nodes.buildNodeCount++;
    } else if (isMultiline) {
      node = Object.create(astNodeBase);
      node.type = 5;
      nodes.buildNodeCount++;
      node.value = lines[i];
      node.line = i;
      nodes.push(node);
    } else if (BUILD_TIME_LINE_MATCHER_TEST_ONLY.test(lines[i])) {
      node = Object.create(astNodeBase);
      node.type = 4;
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
      runtimeLineStartNode.type = 0;
      runtimeCodeLineEndNode.type = 1;
      runtimeCodeNode.type = 3;
      runtimeCodeNode.value = lines[i];
      lineNodes = [runtimeCodeNode];
      lineToMatch = lines[i];
      offset = 0;
      nodes.runtimeLineCount++;
      let runtimeRegexer = new RegExp(RUNTIME_MATCHER);
      for (let result2 of lineToMatch.matchAll(runtimeRegexer)) {
        const [
          input,
          linePrefix,
          functionCall,
          functionArguments,
          suffix
        ] = result2;
        index = result2.index;
        lineNodes[lineNodes.length - 1].value = lineNodes[lineNodes.length - 1].value.substring(0, index - offset) + linePrefix;
        lineNodes.length += 2;
        hasBuildTimeNode = true;
        remainderRunTimeCodeNode = Object.create(astNodeBase);
        interpolatedCodeNode = Object.create(astNodeBase);
        remainderRunTimeCodeNode.line = interpolatedCodeNode.line = i;
        interpolatedCodeNode.type = 2;
        funcArgs = functionArguments || "";
        interpolatedCodeNode.value = `${functionCall === "$" ? "module.namespaceCollisionHack" : functionCall}(` + funcArgs;
        lineNodes[lineNodes.length - 2] = interpolatedCodeNode;
        nodes.buildNodeCount++;
        lineToMatch = result2.input.substring(offset = index + input.length);
        remainderRunTimeCodeNode.value = lineToMatch;
        remainderRunTimeCodeNode.type = 3;
        lineNodes[lineNodes.length - 1] = remainderRunTimeCodeNode;
      }
      if (!hasBuildTimeNode) {
        runtimeLine = Object.create(astNodeBase);
        runtimeLine.line = i;
        runtimeLine.value = lines[i];
        runtimeLine.type = 6;
        nodes.push(runtimeLine);
      } else {
        nodes.push(runtimeLineStartNode, ...lineNodes, runtimeCodeLineEndNode);
      }
    }
  }
  nodes.maxLine = i;
  return nodes;
}
function transformAST(nodes) {
  let code = "var __CODE__ = [];\n\n";
  const maxLineNumber = nodes.maxLine;
  let lines = new Array(maxLineNumber + 3);
  lines.fill("");
  for (let node of nodes) {
    switch (node.type) {
      case 4:
        lines[node.line] += node.value + "\n";
      case 5: {
        lines[node.line] += node.value + "\n\n";
        break;
      }
      case 2: {
        lines[node.line] += "${" + node.value + "}";
        break;
      }
      case 3: {
        lines[node.line] += node.value;
        break;
      }
      case 0: {
        lines[node.line] += "__CODE__.push(`";
        break;
      }
      case 1: {
        lines[node.line] += "`);\n\n";
        break;
      }
      case 6: {
        lines[node.line] += "__CODE__.push(`" + node.value + "`);\n\n";
        break;
      }
    }
  }
  lines.unshift(code);
  lines[lines.length - 1] = `module.exports.default = __CODE__.join("");`;
  return lines.join("");
}
function transform(source) {
  const nodes = buildAST(source);
  if (nodes.buildNodeCount > 0) {
    return transformAST(nodes);
  } else {
    return null;
  }
}
export {
  ASTNodeList,
  ASTNodeType,
  buildAST,
  quickTest,
  transform,
  transformAST
};
