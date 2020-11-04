import { baseTypings } from "./typings-plugin/generateTypings";

enum CharacterType {
  ignore = 0,
  newline = 13, // \n
  whitespace = 1, //

  alphanumeric = 3, // [a-zA-Z0-9]
  control = 4, // @
  scopeOpener = 5, // {
  scopeCloser = 6, // }
  variableMapOpener = 7, // <
  variableMapCloser = 8, // >
  variableMapSeparator = 9, // ,
  inlineOpener = 10, // (
  inlineCloser = 11, // )
  escape = 12, // \
  replacerStart = 2, // $
}

enum ParseOperation {
  findControl = 0,
  determineKeyword = 1,
  determineKeywordAttribute = 2,
  closeVariableMap = 3,
  closeInline = 4,
  determineReplacer = 5,
  closeScope = 6,
  determineName = 7,
  closeName = 8,
}

export enum ASTNodeKeyword {
  source = 0,
  run = 1,
  build = 2,
  export = 3,
  inline = 4,
  replacer = 5,
  root = 6,
}

export interface ASTNode {
  parent?: ASTNode;
  children?: ASTNode[];
  variableMapping: string[];
  keyword: ASTNodeKeyword;
  name?: string;
  value?: string;
  lineStart: number;
  lineEnd: number;
  colStart: number;
  colEnd: number;
  from: number;
  to: number;
}

let astNodeBase: ASTNode = {
  parent: null,
  children: [],
  variableMapping: [],
  keyword: ASTNodeKeyword.source,
  name: "",
  value: "",
  lineStart: 0,
  lineEnd: 0,
  colStart: 0,
  colEnd: 0,
  from: 0,
  to: 0,
};

if (process.env.NODE_ENV === "test") {
  Object.defineProperty(astNodeBase, "k", {
    get() {
      return ASTNodeKeyword[this.keyword];
    },
  });

  astNodeBase.original = function (source) {
    return source.substring(this.from, this.to);
  };
}

const charTypes = new Uint8Array(255);
const incrementLineNumber = new Uint8Array(255);

enum ControlIdentifier {
  invalid = 0,
  inline = 1,
  export = 2,
  build = 3,
  run = 4,
  closeScope = 5,
  interpolateBuild = 6,
}

const Keywords = {
  run: {
    start: "run",
    scope: true,
    inline: true,
    variableMapper: true,
    name: false,
    arguments: false,
    prefixCode: "r".charCodeAt(0),
  },
  build: {
    start: "build",
    scope: true,
    inline: true,
    variableMapper: true,
    name: false,
    arguments: false,
    prefixCode: "b".charCodeAt(0),
  },
  export: {
    start: "export",
    scope: true,
    inline: false,
    variableMapper: false,
    name: true,
    arguments: true,
    prefixCode: "e".charCodeAt(0),
  },
  inline: {
    start: "inline",
    scope: false,
    inline: true,
    variableMapper: true,
    name: false,
    arguments: false,
    prefixCode: "i".charCodeAt(0),
  },
};

const controlIdentifierTypes = new Uint8Array(255);

const controlIdentifierSkipLength = new Uint8Array(6);
const operationsByControlIdentifier = new Uint8Array(6);

const keywordNames = new Array(6);

controlIdentifierTypes[Keywords.inline.prefixCode] = ControlIdentifier.inline;
controlIdentifierTypes[Keywords.run.prefixCode] = ControlIdentifier.run;
controlIdentifierTypes[Keywords.build.prefixCode] = ControlIdentifier.build;
controlIdentifierTypes[Keywords.export.prefixCode] = ControlIdentifier.export;
controlIdentifierTypes["(".charCodeAt(0)] = ControlIdentifier.interpolateBuild;
controlIdentifierTypes["}".charCodeAt(0)] = ControlIdentifier.closeScope;

controlIdentifierSkipLength[ControlIdentifier.inline] = "inline".length - 1;
controlIdentifierSkipLength[ControlIdentifier.run] = "run".length - 1;
controlIdentifierSkipLength[ControlIdentifier.build] = "build".length - 1;
controlIdentifierSkipLength[ControlIdentifier.export] =
  "export function".length - 1;
controlIdentifierSkipLength[ControlIdentifier.closeScope] = 1;
controlIdentifierSkipLength[ControlIdentifier.interpolateBuild] = 1;

keywordNames[ControlIdentifier.inline] = "inline";
keywordNames[ControlIdentifier.run] = "run";
keywordNames[ControlIdentifier.build] = "build";
keywordNames[ControlIdentifier.export] = "export function";
keywordNames[ControlIdentifier.closeScope] = "}";
keywordNames[ControlIdentifier.interpolateBuild] = ")";

operationsByControlIdentifier.fill(ParseOperation.determineKeywordAttribute);
operationsByControlIdentifier[ControlIdentifier.export] =
  ParseOperation.determineName;

const keywordTypes = new Uint8Array(8);
keywordTypes[ControlIdentifier.inline] = ASTNodeKeyword.inline;
keywordTypes[ControlIdentifier.run] = ASTNodeKeyword.run;
keywordTypes[ControlIdentifier.build] = ASTNodeKeyword.build;
keywordTypes[ControlIdentifier.interpolateBuild] = ASTNodeKeyword.build;
keywordTypes[ControlIdentifier.export] = ASTNodeKeyword.export;

incrementLineNumber[CharacterType.newline] = 1;

for (let code = 0; code < 256; code++) {
  if ((code > 64 && code < 91) || (code > 96 && code < 123)) {
    charTypes[code] = CharacterType.alphanumeric;
  } else if (code === "$".charCodeAt(0)) {
    charTypes[code] = CharacterType.replacerStart;
  } else if (code === "\n".charCodeAt(0)) {
    charTypes[code] = CharacterType.newline;
  } else if (code === " ".charCodeAt(0)) {
    charTypes[code] = CharacterType.whitespace;
  } else if (code === "@".charCodeAt(0)) {
    charTypes[code] = CharacterType.control;
  } else if (code === "{".charCodeAt(0)) {
    charTypes[code] = CharacterType.scopeOpener;
  } else if (code === "}".charCodeAt(0)) {
    charTypes[code] = CharacterType.scopeCloser;
  } else if (code === "(".charCodeAt(0)) {
    charTypes[code] = CharacterType.inlineOpener;
  } else if (code === ")".charCodeAt(0)) {
    charTypes[code] = CharacterType.inlineCloser;
  } else if (code === "<".charCodeAt(0)) {
    charTypes[code] = CharacterType.variableMapOpener;
  } else if (code === ",".charCodeAt(0)) {
    charTypes[code] = CharacterType.variableMapSeparator;
  } else if (code === ">".charCodeAt(0)) {
    charTypes[code] = CharacterType.variableMapCloser;
  } else {
  }
}

enum ParseErrorType {
  invalidKeyword = 0,
  invalidExportFunction = 1,
}

class AtbuildParseError extends Error {
  constructor(type: ParseErrorType, message: string) {
    super(message);
    this.type = type;
  }
  type: ParseErrorType;
}

export function buildAST(code: string, filename: string = "file.tsb"): ASTNode {
  const root: ASTNode = Object.create(astNodeBase);
  let sourceNode: ASTNode;
  let position = 0,
    cursor: CharacterType = CharacterType.ignore,
    operation = ParseOperation.findControl,
    controlIdentifierType = ControlIdentifier.invalid,
    line = 0,
    column = 0,
    skipLength = 0,
    parent: ASTNode = root,
    replacerNode: ASTNode,
    keywordNode: ASTNode,
    depthCounter = 0,
    inlineStart = 0,
    inlineEnd = 0,
    scopeStart = 0,
    scopeEnd = 0,
    nameStart = 0,
    variableMapOpenerStart = 0,
    variableMapArgumentStart = 0,
    lastNode: ASTNode,
    replacerStart = 0;

  // sourceNode.parent = parent;
  root.children = [];
  root.keyword = ASTNodeKeyword.root;

  for (position = 0; position < code.length; position++) {
    cursor = charTypes[code.charCodeAt(position)];
    line += incrementLineNumber[cursor];
    column++;
    incrementLineNumber[cursor] && (column = 0);

    if (
      operation === ParseOperation.findControl &&
      cursor === CharacterType.control
    ) {
      // Look at the letter after "@"
      // Is it "r"? Its a run keyword. "e"? export. etc.
      controlIdentifierType =
        controlIdentifierTypes[(cursor = code.charCodeAt(position + 1))];
      skipLength = controlIdentifierSkipLength[controlIdentifierType] | 0;
      // assert its what we expect.
      if (
        controlIdentifierType === ControlIdentifier.invalid ||
        keywordNames[controlIdentifierType] ===
          code.substring(position, position + skipLength + 1)
      ) {
        throw new AtbuildParseError(
          ParseErrorType.invalidKeyword,
          `Invalid token at ${line}:${
            column - 1
          } in ${filename}.\nMust be @run, @build, @export, @inline, or @}.\nReceived ${code
            .substring(position)
            .split(" ")[0]
            .slice(0, 10)}`
        );
      } else if (controlIdentifierType === ControlIdentifier.closeScope) {
        keywordNode.to = position;
        lastNode = keywordNode;

        if (sourceNode) {
          sourceNode.to = parent.to = position;
          sourceNode.lineEnd = parent.lineEnd = line;
          sourceNode.colEnd = parent.colEnd = column;
          sourceNode.parent = parent;
          if (!parent.children.includes(sourceNode)) {
            parent.children.push(sourceNode);
          }
        }

        parent = keywordNode.parent || root;

        operation = ParseOperation.findControl;
        sourceNode = null;
      } else {
        operation = operationsByControlIdentifier[controlIdentifierType];
        if (sourceNode) {
          sourceNode.colEnd = column;
          sourceNode.lineEnd = line;
          sourceNode.to = position - 1;
          sourceNode.value = code.substring(sourceNode.from, position);
        }

        variableMapOpenerStart = variableMapArgumentStart = inlineStart = inlineEnd = 0;

        keywordNode = Object.create(astNodeBase);
        keywordNode.children = [];
        keywordNode.from = position;
        keywordNode.colStart = column;
        keywordNode.lineStart = line;
        keywordNode.parent = parent;
        keywordNode.keyword = keywordTypes[controlIdentifierType];
      }

      // Skip ahead
      position += skipLength;

      // @run <a
      //      ^ cursor is here
    } else if (
      operation === ParseOperation.determineKeywordAttribute &&
      cursor === CharacterType.variableMapOpener
    ) {
      variableMapOpenerStart = position;
      variableMapArgumentStart = position + 1;
      operation = ParseOperation.closeVariableMap;
      // @run <date, toast> (boom)
      //           ^ cursor is here
      lastNode = keywordNode;
    } else if (
      operation === ParseOperation.closeVariableMap &&
      cursor === CharacterType.variableMapSeparator
    ) {
      lastNode = keywordNode;
      variableMapArgumentStart = position + 1;
      (keywordNode.variableMapping || (keywordNode.variableMapping = [])).push(
        code.substring(variableMapArgumentStart, position).trim()
      );
    } else if (
      operation === ParseOperation.closeVariableMap &&
      cursor === CharacterType.variableMapCloser
    ) {
      lastNode = keywordNode;
      // if non-empty variable map, add the variable in
      if (position - 1 !== variableMapArgumentStart) {
        (
          keywordNode.variableMapping || (keywordNode.variableMapping = [])
        ).push(code.substring(variableMapArgumentStart, position - 1).trim());
      }

      operation = ParseOperation.determineKeywordAttribute;
      variableMapOpenerStart = variableMapArgumentStart = inlineStart = inlineEnd = 0;
      // @run (bacon(
      //            ^ cursor is here
    } else if (
      operation === ParseOperation.determineKeywordAttribute &&
      cursor === CharacterType.inlineOpener
    ) {
      lastNode = keywordNode;
      inlineStart = position;
      inlineEnd = 0;
      operation = ParseOperation.closeInline;
      depthCounter = 0;
      // @run (bacon(
      //            ^ cursor is here
    } else if (
      operation === ParseOperation.closeInline &&
      cursor === CharacterType.inlineOpener
    ) {
      lastNode = keywordNode;
      depthCounter++;
      // @run (bacon()
      //             ^ cursor is here
    } else if (
      operation === ParseOperation.closeInline &&
      cursor === CharacterType.inlineCloser &&
      depthCounter > 0
    ) {
      lastNode = keywordNode;
      depthCounter--;
      // @run (bacon())
      //              ^ cursor is here
      // This is the end of the node.
    } else if (
      operation === ParseOperation.closeInline &&
      cursor === CharacterType.inlineCloser &&
      depthCounter === 0 &&
      keywordNode.keyword !== ASTNodeKeyword.export
    ) {
      lastNode = keywordNode;
      keywordNode.value = code.substring(inlineStart + 1, position);
      keywordNode.lineEnd = keywordNode.lineStart = line;
      keywordNode.to = position;
      keywordNode.colEnd = column;
      keywordNode.parent = parent;

      (parent.children || (parent.children = [])).push(keywordNode);
      keywordNode = null;

      // @export function $BitField (bacon) {
      //                                  ^ cursor is here
    } else if (
      operation === ParseOperation.closeInline &&
      cursor === CharacterType.inlineCloser &&
      depthCounter === 0 &&
      keywordNode.keyword === ASTNodeKeyword.export
    ) {
      lastNode = keywordNode;
      keywordNode.value = code.substring(inlineStart + 1, position);
      // Try to find the scope opener.
      operation = ParseOperation.determineKeywordAttribute;

      // @run {
      //      ^ cursor is here
      // This is the start of a new scope.
    } else if (
      operation === ParseOperation.determineKeywordAttribute &&
      cursor === CharacterType.scopeOpener
    ) {
      if (sourceNode) {
        sourceNode.colEnd = column;
        sourceNode.lineEnd = line;
        sourceNode.to = keywordNode.from - 1;
        sourceNode.value = code.substring(sourceNode.from, position);
      }

      keywordNode.parent = parent;
      (parent.children || (parent.children = [])).push(keywordNode);
      parent = keywordNode;

      sourceNode = Object.create(astNodeBase);
      sourceNode.children = [];
      sourceNode.keyword = ASTNodeKeyword.source;
      sourceNode.from = position + 1;
      sourceNode.lineStart = line;
      sourceNode.colStart = column + 1;
      sourceNode.value = code.substring(sourceNode.from, position);
      sourceNode.parent = keywordNode;
      lastNode = sourceNode;
      (keywordNode.children || (keywordNode.children = [])).push(sourceNode);
      operation = ParseOperation.findControl;
      // const bacon = $variable;
      //               ^ cursor is here.
    } else if (
      operation === ParseOperation.findControl &&
      cursor === CharacterType.replacerStart
    ) {
      replacerStart = position;
      operation = ParseOperation.determineReplacer;
      lastNode = keywordNode;
      // const bacon = $variable;
      //                        ^ cursor is here.
    } else if (
      operation === ParseOperation.determineReplacer &&
      cursor !== CharacterType.alphanumeric &&
      position - replacerStart > 0
    ) {
      replacerNode = Object.create(astNodeBase);
      replacerNode.value = code.substring(replacerStart, position);
      replacerNode.from = replacerStart;
      replacerNode.to = position - 1;
      replacerNode.parent = sourceNode;
      (sourceNode.children || (sourceNode.children = [])).push(replacerNode);
      operation = ParseOperation.findControl;
      lastNode = sourceNode;
    } else if (
      operation === ParseOperation.determineName &&
      cursor !== CharacterType.alphanumeric &&
      cursor !== CharacterType.whitespace &&
      cursor !== CharacterType.replacerStart
    ) {
      throw new AtbuildParseError(
        ParseErrorType.invalidExportFunction,
        `"@export function" must have a name that starts with "$" on the same line (${line}:${column} in ${filename})`
      );
      // @export function $CreateBitField
      //                  ^ cursor is here.
    } else if (
      operation === ParseOperation.determineName &&
      cursor === CharacterType.replacerStart
    ) {
      nameStart = position;
      operation = ParseOperation.closeName;
      lastNode = keywordNode;
      // @export function $CreateBitField (
      //                                  ^ cursor is here.
    } else if (
      operation === ParseOperation.closeName &&
      (cursor === CharacterType.whitespace || cursor === CharacterType.newline)
    ) {
      operation = ParseOperation.closeName;
      keywordNode.name = code.substring(nameStart, position);
      // Look for function arguments
      operation = ParseOperation.determineKeywordAttribute;
      lastNode = keywordNode;
    }
    // @export function $CreateBitField(
    //                                 ^ cursor is here.
    else if (
      operation === ParseOperation.closeName &&
      cursor === CharacterType.inlineOpener
    ) {
      operation = ParseOperation.closeName;
      keywordNode.name = code.substring(nameStart, position);
      // Look for function arguments
      operation = ParseOperation.closeInline;
      inlineStart = position;
      lastNode = keywordNode;
    } else if (
      operation === ParseOperation.findControl &&
      cursor !== CharacterType.whitespace &&
      cursor !== CharacterType.newline
    ) {
      sourceNode = Object.create(astNodeBase);
      sourceNode.children = [];
      sourceNode.keyword = ASTNodeKeyword.source;
      sourceNode.from = position;
      sourceNode.lineStart = line;
      sourceNode.colStart = column;
      sourceNode.parent = parent;
    }
  }

  lastNode.to = position;
  lastNode.colEnd = column;
  lastNode.lineEnd = line;

  if (sourceNode) {
    sourceNode.value = code.substring(sourceNode.from, sourceNode.to);
    if (
      sourceNode.parent &&
      sourceNode.parent.children &&
      !sourceNode.parent.children.includes(sourceNode)
    ) {
      sourceNode.parent.children.push(sourceNode);
    } else if (!sourceNode.parent.children) {
      sourceNode.parent.children.push(sourceNode);
    }
  }

  return root;
}

export function transformAST(root: ASTNode): string {
  let source = "";
  for (let i = 0; i < root.children.length; i++) {
    source += visit(root.children[i], i);
  }
  return source;
}

const SOURCE_CODE_VARIABLE = "___source___";
const REPLACERS_VARIABLE = "___replacers___";

function quotedVariableMapping(value: string, index: number) {
  return `"${value}"`;
}

function visit(node: ASTNode, i: number): string {
  let source = `/* ${ASTNodeKeyword[node.keyword]}: ${node.lineStart}:${
    node.colStart
  }-${node.lineEnd}:${node.colEnd} */"`;
  switch (node.keyword) {
    case ASTNodeKeyword.build: {
      source += `\nfunction build__${i}(${SOURCE_CODE_VARIABLE}) {\n${
        node.value || ""
      }`;

      if (node.children) {
        for (let child of node.children) {
          source += visit(child, i + 1);
        }
      }

      const variableMapping = (node.variableMapping || [])
        .map(quotedVariableMapping)
        .join(", ");
      source += `\n}(${SOURCE_CODE_VARIABLE}, [${variableMapping}])`;

      break;
    }

    case ASTNodeKeyword.export: {
      source += `\nmodule.exports.${node.name} = function ${node.name}(${node.value}) {
  const ${SOURCE_CODE_VARIABLE} = [];
  function export__build${i}(${SOURCE_CODE_VARIABLE}) {
`;
      if (node.children) {
        for (let child of node.children) {
          source += visit(child, i + 1);
        }
      }

      // const variableMapping = (node.variableMapping || [])
      //   .map(quotedVariableMapping)
      //   .join(", ");
      source += `\n}(${SOURCE_CODE_VARIABLE})
  return ${SOURCE_CODE_VARIABLE}.join("");
`;

      break;
    }

    case ASTNodeKeyword.inline: {
      throw "Not implemented yet";
      break;
    }

    case ASTNodeKeyword.run: {
      source += `\nfunction run__${i}(${SOURCE_CODE_VARIABLE}, ${REPLACERS_VARIABLE}) {
${node.value || ""}
`;
      if (node.children) {
        for (let child of node.children) {
          source += visit(child, i + 1);
        }
      }

      break;
    }

    case ASTNodeKeyword.source: {
      let value = node.value || "";

      if (
        node.children &&
        node.children.length &&
        node.parent &&
        node.parent.variableMapping &&
        node.parent.variableMapping.length
      ) {
        const slottedValue = [value];

        let replacerIndex = -1;
        let slotOffset = 0;
        let positionOffset = node.from;
        let position = 0;
        for (let i = 0; i < node.children.length; i++) {
          const replacer = node.children[i];
          replacerIndex = node.parent.variableMapping.indexOf(replacer.name);

          if (replacerIndex === -1) {
            continue;
          }

          slottedValue.length += 2;

          slottedValue[slotOffset++] = value.substring(
            position - positionOffset,
            replacer.from - positionOffset
          );

          slottedValue[
            slotOffset++
          ] = `" + ${REPLACERS_VARIABLE}[${replacerIndex}] + "`;

          slottedValue[slotOffset++] = value.substring(
            replacer.to - positionOffset + 1
          );
        }
        value = slottedValue.join("");
      }
      source += `${SOURCE_CODE_VARIABLE}.push("${value}");\n`;
      break;
    }
    default: {
      debugger;
      throw `Invalid ASTNodeKeyword: ${node.keyword}`;
      break;
    }
  }

  return source;
}
