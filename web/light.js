var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};
var __exportStar = (target, module, desc) => {
  __markAsModule(target);
  if (typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module) => {
  if (module && module.__esModule)
    return module;
  return __exportStar(__defProp(__create(__getProtoOf(module)), "default", {value: module, enumerable: true}), module);
};

// src/light/utils.ts
var require_utils = __commonJS((exports) => {
  var __defProp2 = Object.defineProperty;
  var __markAsModule2 = (target) => __defProp2(target, "__esModule", {value: true});
  var __export = (target, all) => {
    __markAsModule2(target);
    for (var name in all)
      __defProp2(target, name, {get: all[name], enumerable: true});
  };
  __export(exports, {
    CHARACTER_TYPES: () => CHARACTER_TYPES2,
    CharacterType: () => CharacterType2
  });
  var CharacterType2;
  (function(CharacterType22) {
    CharacterType22[CharacterType22["expressionStart"] = 1] = "expressionStart";
    CharacterType22[CharacterType22["alphanumeric"] = 2] = "alphanumeric";
    CharacterType22[CharacterType22["isOpeningParenthese"] = 3] = "isOpeningParenthese";
    CharacterType22[CharacterType22["isClosingParenthese"] = 4] = "isClosingParenthese";
    CharacterType22[CharacterType22["other"] = 0] = "other";
  })(CharacterType2 || (CharacterType2 = {}));
  const CHARACTER_TYPES2 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
});

// src/light.ts
const utils = __toModule(require_utils());
const RUNTIME_MATCHER = /(^|\W|"|'|;)(\$\w*)?\(((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\))/g;
const BUILD_TIME_LINE_MATCHER = /\/\/\s*\$\s*(ATBUILD)?/;
const MULTILINE_BUILD_TIME_MATCHER = /^\s*\/\/\s*((\$\$)|(ATBUILD))\s*?/;
const RUNTIME_MATCHER_TEST_ONLY = new RegExp(RUNTIME_MATCHER);
const BUILD_TIME_LINE_MATCHER_TEST_ONLY = new RegExp(BUILD_TIME_LINE_MATCHER);
const MULTILINE_BUILD_TIME_MATCHER_TEST_ONLY = new RegExp(MULTILINE_BUILD_TIME_MATCHER);
const IGNORE_FILE_STRING = "// atbuild-ignore-file";
var RuntimeCursorState;
(function(RuntimeCursorState2) {
  RuntimeCursorState2[RuntimeCursorState2["findStart"] = 0] = "findStart";
  RuntimeCursorState2[RuntimeCursorState2["findClosingParenthese"] = 1] = "findClosingParenthese";
  RuntimeCursorState2[RuntimeCursorState2["findOpeningParenthese"] = 2] = "findOpeningParenthese";
})(RuntimeCursorState || (RuntimeCursorState = {}));
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
function quickTest(source) {
  return source.includes("$") && !source.startsWith(IGNORE_FILE_STRING);
}
function buildAST(source, emptyFunctionNameReplacer = "") {
  const nodes = new ASTNodeList();
  let lines = String(source).split("\n");
  let isMultiline = false, result = null, lineToMatch = "", offset = 0, funcArgs = "", interpolatedCodeNode, runtimeLineStartNode = null, index = 0, runtimeCodeNode = null, runtimeCodeLineEndNode = null, remainderRunTimeCodeNode = null, runtimeLine = null, hasBuildTimeNode = false, node = astNodeBase, linePosition = 0;
  let i = 0;
  if (!source.startsWith(IGNORE_FILE_STRING)) {
    for (i = 0; i < lines.length; i++) {
      if (lines[i].trim().length === 0) {
        continue;
      }
      if (MULTILINE_BUILD_TIME_MATCHER_TEST_ONLY.test(lines[i])) {
        isMultiline = !isMultiline;
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
        runtimeCodeNode = Object.create(astNodeBase);
        runtimeCodeNode.type = 6;
        runtimeCodeNode.value = lines[i];
        runtimeCodeNode.line = i;
        offset = 0;
        nodes.runtimeLineCount++;
        lineToMatch = lines[i];
        let depth = 0, characterType = 0, state = 0, expressionStartPosition = 0, lineNodePosition = Math.max(nodes.length - 1, 0), lineNodeOffset = 0, isFirstInsert = true, needsEmptyFunctionReplacer = 0;
        for (linePosition = 0; linePosition < lineToMatch.length; linePosition++) {
          characterType = utils.CHARACTER_TYPES[lineToMatch.charCodeAt(linePosition)] | 0;
          if (characterType === utils.CharacterType.expressionStart && state === 0) {
            depth = 0;
            expressionStartPosition = linePosition;
            state = 2;
          } else if (characterType === utils.CharacterType.isClosingParenthese && state === 1 && depth === 0) {
            if (isFirstInsert) {
              let _runtimeCodeNode = runtimeCodeNode;
              _runtimeCodeNode.type = 0;
              _runtimeCodeNode.value = "";
              runtimeCodeNode = Object.create(astNodeBase);
              runtimeCodeNode.type = 3;
              runtimeCodeNode.value = lines[i];
              _runtimeCodeNode.line = runtimeCodeNode.line = i;
              nodes.push(_runtimeCodeNode, runtimeCodeNode);
              lineNodePosition = nodes.length - 1;
              isFirstInsert = false;
            }
            nodes[lineNodePosition].value = nodes[lineNodePosition].value.substring(0, expressionStartPosition - lineNodeOffset);
            node = Object.create(astNodeBase);
            node.type = 2;
            node.value = emptyFunctionNameReplacer + lineToMatch.substring(expressionStartPosition + needsEmptyFunctionReplacer, lineNodeOffset = linePosition + 1);
            runtimeCodeNode = Object.create(astNodeBase);
            runtimeCodeNode.type = 3;
            runtimeCodeNode.value = lineToMatch.substring(lineNodeOffset, lineToMatch.length);
            runtimeCodeNode.line = node.line = i;
            nodes.push(node, runtimeCodeNode);
            lineNodePosition += 2;
            state = expressionStartPosition = depth = 0;
            nodes.buildNodeCount++;
          } else if (characterType === utils.CharacterType.isClosingParenthese && state === 1 && depth !== 0) {
            depth--;
          } else if (characterType === utils.CharacterType.isOpeningParenthese && state === 1) {
            depth++;
          } else if (characterType === utils.CharacterType.isOpeningParenthese && state === 2 && depth === 0) {
            state = 1;
            needsEmptyFunctionReplacer = expressionStartPosition + 1 === linePosition ? 1 : 0;
          } else if (state === 2 && characterType === utils.CharacterType.other) {
            state = 0;
            depth = expressionStartPosition = 0;
          }
        }
        if (!isFirstInsert) {
          runtimeCodeLineEndNode = Object.create(astNodeBase);
          runtimeCodeLineEndNode.line = i;
          runtimeCodeLineEndNode.type = 1;
          nodes.push(runtimeCodeLineEndNode);
        } else {
          nodes.push(runtimeCodeNode);
        }
      }
    }
  }
  nodes.maxLine = i;
  return nodes;
}
function transformAST(nodes) {
  let code = "var __CODE__ = '';\n\n";
  const maxLineNumber = nodes.maxLine;
  let lines = new Array(maxLineNumber + 3);
  lines.fill("");
  for (let node of nodes) {
    switch (node.type) {
      case 4:
        lines[node.line] += node.value + "\n";
        break;
      case 5: {
        lines[node.line] += node.value + "\n\n";
        break;
      }
      case 2: {
        lines[node.line] += "${" + node.value.replace(/`/gm, "\\`") + "}";
        break;
      }
      case 3: {
        lines[node.line] += node.value.replace(/`/gm, "\\`").replace(/\$\{/gm, "\\${");
        break;
      }
      case 0: {
        lines[node.line] += "__CODE__ += (`";
        break;
      }
      case 1: {
        lines[node.line] += "`);\n\n";
        break;
      }
      case 6: {
        lines[node.line] += "__CODE__ += (`" + node.value.replace(/`/gm, "\\`").replace(/\$\{/gm, "\\${") + "`);\n\n";
        break;
      }
    }
  }
  lines.unshift(code);
  lines[lines.length - 1] = `module.exports.default = __CODE__;
__CODE__ = "";`;
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
//# sourceMappingURL=light.js.map
