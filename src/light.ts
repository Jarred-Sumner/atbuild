import { CharacterType, CHARACTER_TYPES } from "./light/utils";

const RUNTIME_MATCHER = /(^|\W|"|'|;)(\$\w*)?\(((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\))/g;
const BUILD_TIME_LINE_MATCHER = /\/\/\s*\$\s*(ATBUILD)?/;
const MULTILINE_BUILD_TIME_MATCHER = /^\s*\/\/\s*((\$\$)|(ATBUILD))\s*?/;

const RUNTIME_MATCHER_TEST_ONLY = new RegExp(RUNTIME_MATCHER);
const BUILD_TIME_LINE_MATCHER_TEST_ONLY = new RegExp(BUILD_TIME_LINE_MATCHER);
const MULTILINE_BUILD_TIME_MATCHER_TEST_ONLY = new RegExp(
  MULTILINE_BUILD_TIME_MATCHER
);

const IGNORE_FILE_STRING = "// atbuild-ignore-file";

enum RuntimeCursorState {
  findStart = 0,
  findClosingParenthese = 1,
  findOpeningParenthese = 2,
}

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

export function quickTest(source: string) {
  return source.includes("$") && !source.startsWith(IGNORE_FILE_STRING);
}

export function buildAST(source: string, emptyFunctionNameReplacer = "") {
  const nodes = new ASTNodeList();

  let lines = String(source).split("\n");
  let isMultiline = false,
    result = null,
    lineToMatch: string = "",
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
    node: ASTNode = astNodeBase,
    linePosition = 0;
  let i = 0;
  if (!source.startsWith(IGNORE_FILE_STRING)) {
    for (i = 0; i < lines.length; i++) {
      if (lines[i].trim().length === 0) {
        continue;
      }

      if (MULTILINE_BUILD_TIME_MATCHER_TEST_ONLY.test(lines[i])) {
        isMultiline = !isMultiline;

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
        runtimeCodeNode = Object.create(astNodeBase);

        runtimeCodeNode.type = ASTNodeType.runtimeLine;
        runtimeCodeNode.value = lines[i];
        runtimeCodeNode.line = i;

        offset = 0;
        nodes.runtimeLineCount++;
        lineToMatch = lines[i];

        // This is a handrolled, non ECMAScript compliant JavaScript Function Call Detector™
        // It should detect function calls like so
        // - $("anything-in-here should run in the build script!")
        // - $FooFunction()
        // - $FooFunction("")
        // - $FooFunction("", "")
        // - $BarFunction("", "") $FooFunction("", "")
        // - "runtimeCode" $BarFunction("", "") "runtimeCode" $FooFunction("", "") "runtimeCode"

        // It should not detect things like:
        // - if (bacon) {}
        // - if(bacon) {}
        // - while(!bacon) {}
        // function bacon() {}

        // It does not need to care about nested function calls so long as it knows where the last closing parentheses is.

        // The algorithm is as follows:
        // 1. Find a $
        // 2. Go forward until we reach either:
        //    - An opening parenthese
        //      - Indices from start of $ to position is the function name
        //    - A space, subtraction, addition, var, //, or semicolon
        //     - Reset depth
        //      - Goto 1.
        // 3. Go forward until we reach a closing parenthese matching depth
        //    - If we reach an opening parenthese, increment depth.
        //    - If we reach a closing parenthese prior to correct depth, decrement depth and continue.
        //    - Once reached, goto 1

        let depth = 0,
          characterType = 0,
          state: RuntimeCursorState = RuntimeCursorState.findStart,
          expressionStartPosition = 0,
          lineNodePosition = Math.max(nodes.length - 1, 0),
          lineNodeOffset = 0,
          isFirstInsert = true,
          needsEmptyFunctionReplacer = 0;

        for (
          linePosition = 0;
          linePosition < lineToMatch.length;
          linePosition++
        ) {
          characterType =
            CHARACTER_TYPES[lineToMatch.charCodeAt(linePosition)] | 0;

          //
          if (
            characterType === CharacterType.expressionStart &&
            state === RuntimeCursorState.findStart
          ) {
            depth = 0;
            expressionStartPosition = linePosition;
            state = RuntimeCursorState.findOpeningParenthese;

            // Full match found
            // The happy state.
          } else if (
            characterType === CharacterType.isClosingParenthese &&
            state === RuntimeCursorState.findClosingParenthese &&
            depth === 0
          ) {
            if (isFirstInsert) {
              let _runtimeCodeNode = runtimeCodeNode;
              _runtimeCodeNode.type = ASTNodeType.runtimeLineStart;
              _runtimeCodeNode.value = "";

              runtimeCodeNode = Object.create(astNodeBase);
              runtimeCodeNode.type = ASTNodeType.runtimeCode;
              runtimeCodeNode.value = lines[i];
              _runtimeCodeNode.line = runtimeCodeNode.line = i;

              nodes.push(_runtimeCodeNode, runtimeCodeNode);
              lineNodePosition = nodes.length - 1;
              isFirstInsert = false;
            }

            nodes[lineNodePosition].value = nodes[
              lineNodePosition
            ].value.substring(0, expressionStartPosition - lineNodeOffset);

            node = Object.create(astNodeBase);
            node.type = ASTNodeType.buildTimeCode;
            node.value =
              emptyFunctionNameReplacer +
              lineToMatch.substring(
                expressionStartPosition + needsEmptyFunctionReplacer,
                (lineNodeOffset = linePosition + 1)
              );

            runtimeCodeNode = Object.create(astNodeBase);
            runtimeCodeNode.type = ASTNodeType.runtimeCode;
            runtimeCodeNode.value = lineToMatch.substring(
              lineNodeOffset,
              lineToMatch.length
            );

            runtimeCodeNode.line = node.line = i;

            nodes.push(node, runtimeCodeNode);
            lineNodePosition += 2;
            state = expressionStartPosition = depth = 0;

            nodes.buildNodeCount++;
          } else if (
            characterType === CharacterType.isClosingParenthese &&
            state === RuntimeCursorState.findClosingParenthese &&
            depth !== 0
          ) {
            depth--;
          } else if (
            characterType === CharacterType.isOpeningParenthese &&
            state === RuntimeCursorState.findClosingParenthese
          ) {
            depth++;

            // it matches $Foo( or $(
          } else if (
            characterType === CharacterType.isOpeningParenthese &&
            state === RuntimeCursorState.findOpeningParenthese &&
            depth === 0
          ) {
            state = RuntimeCursorState.findClosingParenthese;
            needsEmptyFunctionReplacer =
              expressionStartPosition + 1 === linePosition ? 1 : 0;
            // Reset back to findStart. This is a space or delimiter of some kind.
          } else if (
            state === RuntimeCursorState.findOpeningParenthese &&
            characterType === CharacterType.other
          ) {
            state = RuntimeCursorState.findStart;
            depth = expressionStartPosition = 0;
          }
        }

        if (!isFirstInsert) {
          runtimeCodeLineEndNode = Object.create(astNodeBase);

          runtimeCodeLineEndNode.line = i;
          runtimeCodeLineEndNode.type = ASTNodeType.runtimeLineEnd;

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

export function transformAST(nodes: ASTNodeList) {
  let code = "var __CODE__ = '';\n\n";
  const maxLineNumber = nodes.maxLine;
  let lines = new Array(maxLineNumber + 3);
  lines.fill("");

  for (let node of nodes) {
    switch (node.type) {
      case ASTNodeType.buildTimeLine:
        lines[node.line] += node.value + "\n";
        break;

      case ASTNodeType.multilineBuildTimeLine: {
        lines[node.line] += node.value + "\n\n";
        break;
      }

      case ASTNodeType.buildTimeCode: {
        lines[node.line] += "${" + node.value.replace(/`/gm, "\\`") + "}";
        break;
      }
      case ASTNodeType.runtimeCode: {
        // prettier-ignore
        lines[node.line] += node.value.replace(/`/gm, "\\`").replace(/\$\{/gm, "\\${")
        break;
      }

      case ASTNodeType.runtimeLineStart: {
        lines[node.line] += "__CODE__ += (`";
        break;
      }

      case ASTNodeType.runtimeLineEnd: {
        lines[node.line] += "`);\n\n";
        break;
      }
      case ASTNodeType.runtimeLine: {
        lines[node.line] +=
          "__CODE__ += (`" +
          node.value.replace(/`/gm, "\\`").replace(/\$\{/gm, "\\${") +
          "`);\n\n";
        break;
      }
    }
  }
  lines.unshift(code);

  lines[
    lines.length - 1
  ] = `module.exports.default = __CODE__;\n__CODE__ = "";`;
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
