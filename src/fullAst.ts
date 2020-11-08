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
  quote = 12,
}

export enum Scope {
  none = 0,
  inline = 1,
  multiline = 2,
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
  interpolate = 7,
}

export interface ASTNode {
  parent?: ASTNode;
  children?: ASTNode[];
  variableMapping: string[];
  keyword: ASTNodeKeyword;
  name?: string;
  scope: Scope;
  value?: string;
  lineStart: number;
  functionDeclarationSuffix: string;
  lineEnd: number;
  colStart: number;
  colEnd: number;
  from: number;
  to: number;
}

let astNodeBase: ASTNode = {
  children: [],
  variableMapping: [],
  scope: Scope.none,
  keyword: ASTNodeKeyword.source,
  name: "",
  value: "",
  functionDeclarationSuffix: "",
  lineStart: 0,
  lineEnd: 0,
  colStart: 0,
  colEnd: 0,
  from: 0,
  to: 0,
};

const ScopeNames = {
  [Scope.inline]: "inline",
  [Scope.none]: null,
  [Scope.multiline]: "multiline",
};

const KeywordName = {
  [ASTNodeKeyword.source]: "source",
  [ASTNodeKeyword.run]: "run",
  [ASTNodeKeyword.build]: "build",
  [ASTNodeKeyword.export]: "export",
  [ASTNodeKeyword.inline]: "inline",
  [ASTNodeKeyword.replacer]: "$",
  [ASTNodeKeyword.root]: "root",
};

const _toJSON = (item) => item.toJSON();

astNodeBase.toJSON = function () {
  const {
    parent,
    _parent,
    scope,
    keyword,
    children,
    colStart,
    lineStart,
    lineEnd,
    colEnd,
    ...json
  } = this as ASTNode;
  return {
    ...json,
    children: children.map(_toJSON),
    scope: ScopeNames[scope],
    keyword: KeywordName[keyword],
    column: {
      start: colStart,
      end: colEnd,
    },
    line: {
      start: lineStart,
      end: lineEnd,
    },
  };
};

if (typeof WeakRef !== "undefined") {
  Object.defineProperty(astNodeBase, "parent", {
    get() {
      return this._parent && this._parent.deref();
    },

    set(parent) {
      if (parent) {
        return (this._parent = new WeakRef(parent));
      } else {
        return (this._parent = null);
      }
    },
  });
}

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
const emptyCharTypes = new Uint8Array(255);
const incrementLineNumber = new Uint8Array(255);

enum ControlIdentifier {
  invalid = 0,
  inline = 1,
  export = 2,
  build = 3,
  run = 4,
  closeScope = 5,
  interpolate = 6,
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

const controlIdentifierSkipLength = new Uint8Array(8);
const operationsByControlIdentifier = new Uint8Array(8);

const keywordNames = new Array(6);

function getControlIdentifier(code: string, position: number) {
  if (code[position + 1] === "e" && code[position + 2] === "n") {
    return ControlIdentifier.closeScope;
  } else {
    return controlIdentifierTypes[code.charCodeAt(position + 1)];
  }
}

emptyCharTypes.fill(0);
emptyCharTypes[CharacterType.whitespace] = 1;
emptyCharTypes[CharacterType.newline] = 1;
controlIdentifierTypes[Keywords.inline.prefixCode] = ControlIdentifier.inline;
controlIdentifierTypes[Keywords.run.prefixCode] = ControlIdentifier.run;
controlIdentifierTypes[Keywords.build.prefixCode] = ControlIdentifier.build;
controlIdentifierTypes[Keywords.export.prefixCode] = ControlIdentifier.export;
controlIdentifierTypes["(".charCodeAt(0)] = ControlIdentifier.interpolate;

charTypes[`"`.charCodeAt(0)] = CharacterType.quote;
charTypes[`'`.charCodeAt(0)] = CharacterType.quote;
charTypes["`".charCodeAt(0)] = CharacterType.quote;

controlIdentifierSkipLength[ControlIdentifier.inline] = "inline".length;
controlIdentifierSkipLength[ControlIdentifier.run] = "run".length;
controlIdentifierSkipLength[ControlIdentifier.build] = "build".length;
controlIdentifierSkipLength[ControlIdentifier.interpolate] = "(".length;
controlIdentifierSkipLength[
  ControlIdentifier.export
] = "export function".length;
controlIdentifierSkipLength[ControlIdentifier.closeScope] = "end".length;

keywordNames[ControlIdentifier.inline] = "inline";
keywordNames[ControlIdentifier.run] = "run";
keywordNames[ControlIdentifier.build] = "build";
keywordNames[ControlIdentifier.export] = "export function";
keywordNames[ControlIdentifier.closeScope] = "end";
keywordNames[ControlIdentifier.interpolate] = "(";

operationsByControlIdentifier.fill(ParseOperation.determineKeywordAttribute);
operationsByControlIdentifier[0] = ParseOperation.findControl;
operationsByControlIdentifier[ControlIdentifier.export] =
  ParseOperation.determineName;
operationsByControlIdentifier[ControlIdentifier.interpolate] =
  ParseOperation.closeInline;

const keywordTypes = new Uint8Array(8);
keywordTypes[ControlIdentifier.inline] = ASTNodeKeyword.inline;
keywordTypes[ControlIdentifier.run] = ASTNodeKeyword.run;
keywordTypes[ControlIdentifier.build] = ASTNodeKeyword.build;
keywordTypes[ControlIdentifier.interpolate] = ASTNodeKeyword.interpolate;
keywordTypes[ControlIdentifier.export] = ASTNodeKeyword.export;

incrementLineNumber[CharacterType.newline] = 1;

const backtrackAmount = new Int8Array(16);
backtrackAmount[CharacterType.newline] = -1;
backtrackAmount[CharacterType.whitespace] = -1;

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
  strayOpenBrace = 2,
}

const ParseErrorNames = {
  [ParseErrorType.strayOpenBrace]: "Invalid {",
  [ParseErrorType.invalidKeyword]: "Invalid keyword",
  [ParseErrorType.invalidExportFunction]: "Invalid export function",
};

class AtbuildParseError extends Error {
  constructor(type: ParseErrorType, name: string, message: string) {
    super(message);
    this.name = name;
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
    prevCursor: CharacterType = cursor,
    line = 0,
    column = 0,
    skipLength = 0,
    parent: ASTNode = root,
    replacerNode: ASTNode,
    keywordNode: ASTNode,
    inlineDepthCount = 0,
    scopeDepthCount = 0,
    inlineStart = 0,
    nameStart = 0,
    variableMapOpenerStart = 0,
    variableMapArgumentStart = 0,
    lastNode: ASTNode,
    endOfPreviousLine = 0,
    endOfPreviousLineColumn = 0,
    isLineEmpty = 1,
    inlineEnd = 0,
    replacerStart = 0;

  // sourceNode.parent = parent;
  root.children = [];
  root.keyword = ASTNodeKeyword.root;

  for (position = 0; position < code.length; position++, prevCursor = cursor) {
    cursor = charTypes[code.charCodeAt(position)];
    if (incrementLineNumber[cursor]) {
      endOfPreviousLine = position - 1;
      endOfPreviousLineColumn = column;
      line++;
      column = -1;
      isLineEmpty = 1;
    } else {
    }

    isLineEmpty = Math.min(isLineEmpty, emptyCharTypes[cursor]);

    column++;

    if (
      operation === ParseOperation.findControl &&
      cursor === CharacterType.control &&
      (prevCursor !== CharacterType.quote ||
        controlIdentifierTypes[code.charCodeAt(position + 1)])
    ) {
      // Look at the letter after "@"
      // Is it "r"? Its a run keyword. "e"? export. etc.
      controlIdentifierType = getControlIdentifier(code, position);

      skipLength = controlIdentifierSkipLength[controlIdentifierType] | 0;
      // assert its what we expect.
      if (
        controlIdentifierType === ControlIdentifier.invalid ||
        keywordNames[controlIdentifierType] !==
          code.substring(position + 1, position + skipLength + 1)
      ) {
        throw new AtbuildParseError(
          ParseErrorType.invalidKeyword,
          `Invalid @ keyword in ${filename}:${line}:${column - 1}`,
          `Invalid @ keyword in ${filename}:${line}:${
            column - 1
          }. Must be @run, @build, @export function $, @inline, @(buildCode), or @end. Received "${code
            .substring(position)
            .split(" ")[0]
            .slice(0, 10)
            .replace("\n", "\\n")}"\n`
        );
      } else if (controlIdentifierType === ControlIdentifier.closeScope) {
        keywordNode.to = position;
        keywordNode.lineEnd = line - 1;
        keywordNode.colEnd = endOfPreviousLineColumn;
        keywordNode.scope = Scope.multiline;

        // parent.children.push(keywordNode);

        if (sourceNode) {
          sourceNode.to = parent.to = keywordNode.to;
          sourceNode.lineEnd = parent.lineEnd = line - 1;
          sourceNode.colEnd = parent.colEnd = endOfPreviousLineColumn;
          sourceNode.parent = parent;
          // sourceNode.value = code.substring(sourceNode.from, sourceNode.to);
          if (
            sourceNode.value.length &&
            !keywordNode.children.includes(sourceNode)
          ) {
            keywordNode.children.push(sourceNode);
          }
          sourceNode = null;
        }
        keywordNode = parent || root;
        parent = keywordNode.parent || root;

        scopeDepthCount = 0;

        operation = ParseOperation.findControl;

        // lastNode = sourceNode = Object.create(astNodeBase);
        // sourceNode.children = [];
        // sourceNode.keyword = ASTNodeKeyword.source;
        // sourceNode.from = position + 1; //+ backtrackAmount[prevCursor];
        // sourceNode.lineStart = line;
        // sourceNode.colStart = column;
        // sourceNode.parent = parent;
        // lastNode = keywordNode;
      } else {
        operation = operationsByControlIdentifier[controlIdentifierType];
        if (sourceNode) {
          sourceNode.colEnd = column;
          sourceNode.lineEnd = line;
          sourceNode.to = position;
          sourceNode = null;
          //sourceNode.value = code.substring(sourceNode.from, position);
        }

        variableMapOpenerStart = variableMapArgumentStart = inlineStart = 0;

        keywordNode = Object.create(astNodeBase);
        keywordNode.children = [];
        keywordNode.from = position;
        keywordNode.colStart = column;
        keywordNode.lineStart = line;

        keywordNode.keyword = keywordTypes[controlIdentifierType];
        if (keywordNode.keyword === ASTNodeKeyword.export) {
          keywordNode.parent = parent = root;
        } else {
          keywordNode.parent = parent;
        }

        if (operation === ParseOperation.closeInline) {
          // @(bacon)
          // ^ === position
          //   ^ === desired position
          inlineStart = position + 2;

          sourceNode = Object.create(astNodeBase);
          sourceNode.lineStart = line;
          sourceNode.from = inlineStart;
          sourceNode.parent = keywordNode;
          sourceNode.colStart = column;
        }
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
      variableMapOpenerStart = variableMapArgumentStart = inlineStart = 0;
      // @export function $Foo(bacon) {
      //                      ^ cursor is here
    } else if (
      operation === ParseOperation.determineKeywordAttribute &&
      cursor === CharacterType.inlineOpener &&
      keywordNode.keyword === ASTNodeKeyword.export
    ) {
      lastNode = keywordNode;
      inlineStart = position;
      operation = ParseOperation.closeInline;
      inlineDepthCount = 0;
      keywordNode.scope = Scope.multiline;

      // @run (bacon(
      //            ^ cursor is here
    } else if (
      operation === ParseOperation.determineKeywordAttribute &&
      cursor === CharacterType.newline &&
      (keywordNode.keyword === ASTNodeKeyword.build ||
        keywordNode.keyword === ASTNodeKeyword.run) &&
      keywordNode.scope === Scope.none
    ) {
      operation = ParseOperation.findControl;
      lastNode = keywordNode;
      keywordNode.scope = Scope.multiline;
      parent.children.push(keywordNode);
      parent = keywordNode;
      // sourceNode = null;
      sourceNode = null;
    } else if (
      operation === ParseOperation.determineKeywordAttribute &&
      cursor === CharacterType.inlineOpener &&
      keywordNode.keyword !== ASTNodeKeyword.export
    ) {
      lastNode = keywordNode;
      inlineStart = position;
      operation = ParseOperation.closeInline;
      inlineDepthCount = 0;
      keywordNode.scope = Scope.inline;
      sourceNode = Object.create(astNodeBase);
      sourceNode.from = position + 1;
      sourceNode.parent = keywordNode;
      sourceNode.colStart = column;
      sourceNode.lineStart = line;

      // @run (bacon(
      //            ^ cursor is here
    } else if (
      operation === ParseOperation.closeInline &&
      cursor === CharacterType.inlineOpener
    ) {
      lastNode = keywordNode;
      inlineDepthCount++;
      // @run (bacon()
      //             ^ cursor is here
    } else if (
      operation === ParseOperation.closeInline &&
      cursor === CharacterType.inlineCloser &&
      inlineDepthCount > 0
    ) {
      lastNode = keywordNode;
      inlineDepthCount--;
      // @run (bacon())
      //              ^ cursor is here
      // This is the end of the node.
    } else if (
      operation === ParseOperation.closeInline &&
      cursor === CharacterType.inlineCloser &&
      inlineDepthCount === 0 &&
      keywordNode.keyword !== ASTNodeKeyword.export
    ) {
      lastNode = keywordNode;
      keywordNode.lineEnd = keywordNode.lineStart = line;
      keywordNode.to = position;
      keywordNode.colEnd = column;
      keywordNode.parent = parent;
      keywordNode.scope = Scope.inline;

      if (sourceNode) {
        sourceNode.to = position;
        // sourceNode.value = code.substring(sourceNode.from, sourceNode.to);
        sourceNode.parent = keywordNode;
        keywordNode.children = [sourceNode];
        sourceNode = null;
      }

      (parent.children || (parent.children = [])).push(keywordNode);
      keywordNode = parent;

      operation = ParseOperation.findControl;
      sourceNode = Object.create(astNodeBase);

      sourceNode.from = position + 1;
      sourceNode.parent = keywordNode;
      keywordNode.children.push(sourceNode);
      // sourceNode = null;

      // @export function $BitField (bacon) {
      //                                  ^ cursor is here
    } else if (
      operation === ParseOperation.closeInline &&
      cursor === CharacterType.inlineCloser &&
      inlineDepthCount === 0 &&
      keywordNode.keyword === ASTNodeKeyword.export
    ) {
      lastNode = keywordNode;
      keywordNode.value = code.substring(inlineStart + 1, position);
      keywordNode.lineStart = line;
      // Everything after this is the source of the function
      operation = ParseOperation.findControl;
      root.children.push(keywordNode);
      keywordNode.parent = root;
      inlineEnd = position + 1;
      parent = keywordNode;

      // @run {
      //      ^ cursor is here
      // This is the start of a new scope.
    } else if (
      cursor === CharacterType.newline &&
      parent.keyword === ASTNodeKeyword.export &&
      line - 1 === parent.lineStart
    ) {
      parent.functionDeclarationSuffix = code.substring(inlineEnd, position);
      if (
        parent.functionDeclarationSuffix.length &&
        parent.functionDeclarationSuffix.lastIndexOf("{") ===
          parent.functionDeclarationSuffix.length - 1
      ) {
        throw new AtbuildParseError(
          ParseErrorType.strayOpenBrace,
          `Unnecessary { at ${
            line - 1
          }:${endOfPreviousLineColumn} in ${filename}`,
          `@export function should not have "{" or "}" at the start or end, it will be added at build-time. Use @end at the end.`
        );
      }
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
      position - replacerStart > 0 &&
      sourceNode
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
        `Invalid @export function`,
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
      cursor !== CharacterType.newline &&
      !isLineEmpty &&
      !sourceNode &&
      !(
        keywordNode &&
        keywordNode.keyword === ASTNodeKeyword.export &&
        line === keywordNode.lineStart
      )
    ) {
      lastNode = sourceNode = Object.create(astNodeBase);
      sourceNode.children = [];
      sourceNode.keyword = ASTNodeKeyword.source;
      sourceNode.from = position;
      sourceNode.lineStart = line;
      sourceNode.colStart = column;
      sourceNode.parent = parent;
      parent.children.push(sourceNode);
    }
  }

  if (sourceNode && sourceNode.parent === root) {
    sourceNode.to = root.to = position;
  }

  // if (sourceNode) {
  //   sourceNode.to = Math.min(position - 1, sourceNode.to);
  // }

  // if (keywordNode) {
  //   keywordNode.to = Math.min(position - 1, keywordNode.to);
  // }

  // if (parent) {
  //   parent.to = Math.min(position - 1, parent.to);
  // }

  // if (sourceNode) {
  //   sourceNode.value = code.substring(sourceNode.from, sourceNode.to);
  //   if (
  //     sourceNode.parent &&
  //     sourceNode.parent.children &&
  //     !sourceNode.parent.children.includes(sourceNode)
  //   ) {
  //     sourceNode.parent.children.push(sourceNode);
  //   } else if (!sourceNode.parent.children) {
  //     sourceNode.parent.children.push(sourceNode);
  //   }
  // }

  return root;
}

export function transformAST(root: ASTNode, code: string): string {
  let source = `var _this = {["${PARTIAL_SOURCE_CODE_VARIABLE}"]: ""};\n`;
  let needsRootSource = false;
  for (let i = 0; i < root.children.length; i++) {
    if (
      !needsRootSource &&
      root.children[i].keyword !== ASTNodeKeyword.export
    ) {
      needsRootSource = true;
    }

    source += visit(root.children[i], i, root, true, code);
  }

  if (needsRootSource) {
    if (
      !(
        source[source.length - 1] === ";" ||
        (source[source.length - 2] === ";" &&
          source[source.length - 1] === "\n")
      )
    ) {
      source += ";";
    }

    source += `\nmodule.exports.default = ${SOURCE_CODE_VARIABLE};\n${SOURCE_CODE_VARIABLE} = "";\n`;
  }

  return source;
}

const PARTIAL_SOURCE_CODE_VARIABLE = "___source___";
const SOURCE_CODE_VARIABLE = `_this.${PARTIAL_SOURCE_CODE_VARIABLE}`;

const REPLACERS_VARIABLE = "___replacers___";

function quotedVariableMapping(value: string, index: number) {
  return `"${value}"`;
}

function visit(
  node: ASTNode,
  i: number,
  parent: ASTNode | null,
  trailingNewline = true,
  input: string
): string {
  let functionName = `${ASTNodeKeyword[node.keyword]}___${node.lineStart}_${
    node.colStart
  }__${node.lineEnd}_${node.colEnd}`;
  let source = "";

  switch (node.keyword) {
    case ASTNodeKeyword.interpolate: {
      switch (parent.keyword) {
        case ASTNodeKeyword.build:
        case ASTNodeKeyword.export:
        case ASTNodeKeyword.root: {
          node.keyword = ASTNodeKeyword.run;
          return visit(node, i, parent, trailingNewline, input);
        }
        case ASTNodeKeyword.run: {
          node.keyword = ASTNodeKeyword.build;
          return visit(node, i, parent, trailingNewline, input);
        }

        default:
          throw "Invalid input";
      }
    }

    case ASTNodeKeyword.build: {
      if (node.scope === Scope.inline) {
        if (node.parent && node.parent.keyword === ASTNodeKeyword.run) {
          source += `${SOURCE_CODE_VARIABLE} += (`;
        }
        // source += `(function ${functionName}(${SOURCE_CODE_VARIABLE})  { return (`;
        if (node.children) {
          for (let child of node.children) {
            source += visit(child, i + 1, node, false, input);
          }
        }
        // const variableMapping = (node.variableMapping || [])
        //   .map(quotedVariableMapping)
        //   .join(", ");
        // source += `);})(${SOURCE_CODE_VARIABLE}, [${variableMapping}])`;
      } else if (
        node.scope === Scope.multiline &&
        parent.keyword !== ASTNodeKeyword.root
      ) {
        // source += `(function build__${i}(){${node.value || ""}\n`;
        if (node.children) {
          for (let child of node.children) {
            source += visit(child, i + 1, node, trailingNewline, input);
          }
        }

        // source += `\n`;
      } else if (
        node.scope === Scope.multiline &&
        parent.keyword === ASTNodeKeyword.root
      ) {
        if (node.children) {
          for (let child of node.children) {
            source += visit(child, i + 1, node, trailingNewline, input);
          }
        }
      } else {
        throw "Not implemented";
      }

      if (
        node.scope === Scope.inline &&
        parent &&
        parent.keyword === ASTNodeKeyword.run
      ) {
        source += `);`;
      }

      break;
    }

    case ASTNodeKeyword.export: {
      source += `\n;var ${node.name} = (module.exports.${
        node.name
      } = (function ${node.name}(${node.value.trim().split(",").join(", ")})${
        node.functionDeclarationSuffix
      } {
        let originalThis = _this;

        if (!this || typeof this["${PARTIAL_SOURCE_CODE_VARIABLE}"] === 'undefined') {
          _this = {
            ["${PARTIAL_SOURCE_CODE_VARIABLE}"]: ""
          }
        } else {
          _this = this;
        }

        const buildEval = (function ${functionName}() {\n`;
      if (node.children) {
        for (let child of node.children) {
          source += visit(child, i + 1, node, trailingNewline, input);
        }
      }

      // const variableMapping = (node.variableMapping || [])
      //   .map(quotedVariableMapping)
      //   .join(", ");
      source += `\n})();
    let output = ${SOURCE_CODE_VARIABLE};
    _this = originalThis;
  return typeof buildEval === 'undefined' ? output : buildEval;
}));\n\n`;

      break;
    }

    case ASTNodeKeyword.inline: {
      throw "Not implemented yet";
      break;
    }

    case ASTNodeKeyword.run: {
      // if (parent.keyword !== ASTNodeKeyword.build) {
      //   source += `(function run__${i}(${SOURCE_CODE_VARIABLE}, ${REPLACERS_VARIABLE}) {
      //     ${node.value || ""}
      //     `;
      // }

      if (node.children) {
        for (let child of node.children) {
          source += visit(child, i + 1, node, trailingNewline, input);
        }
      }

      // if (parent.keyword !== ASTNodeKeyword.build) {
      //   source += `})();\n`;
      // }

      break;
    }

    case ASTNodeKeyword.source: {
      let value = input.substring(node.from, Math.min(node.to, input.length));

      if (
        parent.keyword === ASTNodeKeyword.build ||
        parent.keyword === ASTNodeKeyword.export ||
        parent.keyword === ASTNodeKeyword.inline
      ) {
        return trailingNewline ? value : value.trimEnd();
      } else if (
        parent.keyword === ASTNodeKeyword.run ||
        parent.keyword === ASTNodeKeyword.root
      ) {
        if (
          node.children &&
          node.children.length &&
          parent &&
          parent.variableMapping &&
          parent.variableMapping.length
        ) {
          const slottedValue = [value];

          let replacerIndex = -1;
          let slotOffset = 0;
          let positionOffset = node.from;
          let position = 0;
          for (let i = 0; i < node.children.length; i++) {
            const replacer = node.children[i];
            replacerIndex = parent.variableMapping.indexOf(replacer.name);

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
        source += `${SOURCE_CODE_VARIABLE} += "${value
          .replace(/\n/gm, "\\n")
          .replace(/"/gm, '\\"')}";${trailingNewline ? "\n" : ""}`;
      } else {
        throw "Unhandled keyword type";
      }

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
