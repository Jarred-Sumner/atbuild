var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};

// src/atbuild.ts
var require_atbuild = __commonJS((exports, module) => {
  __export(exports, {
    AtBuild: () => AtBuild,
    buildAST: () => buildAST,
    default: () => $,
    requireFromString: () => requireFromString,
    transformAST: () => transformAST
  });
  let fs;
  const HEADER_STRING = '/* eslint-disable */\n// @ts-nocheck\n// @ts-ignore\n// @noflow\n"use strict";\n\n';
  let requireFromString;
  if (true) {
    requireFromString = (code) => eval(`
  () => {
    var exports = {default: null};
` + code.replace("module.exports", "exports") + `
  }()
`);
  } else {
    requireFromString = null.requireFromString;
    fs = null;
  }
  class AtBuild {
    static buildAST(code, filename) {
      return buildAST(code, filename);
    }
    static *findNodesAtLine(nodes, lineNumber) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.lineNumber === lineNumber) {
          yield node;
        }
      }
    }
    static evalFile(path, header) {
      return this.eval(fs.readFileSync(path), path, header, module.parent);
    }
    static async evalFileAsync(path, header) {
      return await this.evalAsync(fs.readFileSync(path), path, header, module.parent);
    }
    static _eval(code, filepath = null, addHeader = false, requireFunc = module.require) {
      let source = requireFromString(code, filepath, requireFunc);
      if (addHeader) {
        source = HEADER_STRING + source;
      }
      return source;
    }
    static eval(code, filepath = null, addHeader = false, requireFunc = module.require) {
      const ast = AtBuild.buildAST(code);
      const processed = AtBuild.transformAST(ast, code);
      const res = this._eval(processed, filepath, addHeader, requireFunc);
      if (res && res.default) {
        return res.default;
      } else {
        return res;
      }
    }
    static async evalAsync(code, filepath = null, addHeader = false, requireFunc = module.require) {
      const ast = AtBuild.buildAST(code);
      const processed = AtBuild.transformAST(ast, code);
      let source = await requireFromString(processed, filepath, requireFunc);
      if (addHeader) {
        source = HEADER_STRING + source;
      }
      return source;
    }
  }
  AtBuild.transformAST = transformAST;
  AtBuild.ASTResponseType = {
    BuildtimeCode: 0,
    RuntimeCode: 1
  };
  function $(arg) {
    return arg;
  }
});

// src/fullAst.ts
var CharacterType;
(function(CharacterType2) {
  CharacterType2[CharacterType2["ignore"] = 0] = "ignore";
  CharacterType2[CharacterType2["newline"] = 13] = "newline";
  CharacterType2[CharacterType2["whitespace"] = 1] = "whitespace";
  CharacterType2[CharacterType2["alphanumeric"] = 3] = "alphanumeric";
  CharacterType2[CharacterType2["control"] = 4] = "control";
  CharacterType2[CharacterType2["scopeOpener"] = 5] = "scopeOpener";
  CharacterType2[CharacterType2["scopeCloser"] = 6] = "scopeCloser";
  CharacterType2[CharacterType2["variableMapOpener"] = 7] = "variableMapOpener";
  CharacterType2[CharacterType2["variableMapCloser"] = 8] = "variableMapCloser";
  CharacterType2[CharacterType2["variableMapSeparator"] = 9] = "variableMapSeparator";
  CharacterType2[CharacterType2["inlineOpener"] = 10] = "inlineOpener";
  CharacterType2[CharacterType2["inlineCloser"] = 11] = "inlineCloser";
  CharacterType2[CharacterType2["escape"] = 12] = "escape";
  CharacterType2[CharacterType2["replacerStart"] = 2] = "replacerStart";
  CharacterType2[CharacterType2["quote"] = 12] = "quote";
})(CharacterType || (CharacterType = {}));
var Scope;
(function(Scope2) {
  Scope2[Scope2["none"] = 0] = "none";
  Scope2[Scope2["inline"] = 1] = "inline";
  Scope2[Scope2["multiline"] = 2] = "multiline";
})(Scope || (Scope = {}));
var ParseOperation;
(function(ParseOperation2) {
  ParseOperation2[ParseOperation2["findControl"] = 0] = "findControl";
  ParseOperation2[ParseOperation2["determineKeyword"] = 1] = "determineKeyword";
  ParseOperation2[ParseOperation2["determineKeywordAttribute"] = 2] = "determineKeywordAttribute";
  ParseOperation2[ParseOperation2["closeVariableMap"] = 3] = "closeVariableMap";
  ParseOperation2[ParseOperation2["closeInline"] = 4] = "closeInline";
  ParseOperation2[ParseOperation2["determineReplacer"] = 5] = "determineReplacer";
  ParseOperation2[ParseOperation2["closeScope"] = 6] = "closeScope";
  ParseOperation2[ParseOperation2["determineName"] = 7] = "determineName";
  ParseOperation2[ParseOperation2["closeName"] = 8] = "closeName";
})(ParseOperation || (ParseOperation = {}));
var ASTNodeKeyword;
(function(ASTNodeKeyword2) {
  ASTNodeKeyword2[ASTNodeKeyword2["source"] = 0] = "source";
  ASTNodeKeyword2[ASTNodeKeyword2["run"] = 1] = "run";
  ASTNodeKeyword2[ASTNodeKeyword2["build"] = 2] = "build";
  ASTNodeKeyword2[ASTNodeKeyword2["export"] = 3] = "export";
  ASTNodeKeyword2[ASTNodeKeyword2["inline"] = 4] = "inline";
  ASTNodeKeyword2[ASTNodeKeyword2["replacer"] = 5] = "replacer";
  ASTNodeKeyword2[ASTNodeKeyword2["root"] = 6] = "root";
  ASTNodeKeyword2[ASTNodeKeyword2["interpolate"] = 7] = "interpolate";
})(ASTNodeKeyword || (ASTNodeKeyword = {}));
let astNodeBase = {
  children: [],
  variableMapping: [],
  scope: 0,
  keyword: 0,
  name: "",
  value: "",
  functionDeclarationSuffix: "",
  lineStart: 0,
  lineEnd: 0,
  colStart: 0,
  colEnd: 0,
  from: 0,
  to: 0
};
const ScopeNames = {
  [1]: "inline",
  [0]: null,
  [2]: "multiline"
};
const KeywordName = {
  [0]: "source",
  [1]: "run",
  [2]: "build",
  [3]: "export",
  [4]: "inline",
  [5]: "$",
  [6]: "root"
};
const _toJSON = (item) => item.toJSON();
astNodeBase.toJSON = function() {
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
  } = this;
  return {
    ...json,
    children: children.map(_toJSON),
    scope: ScopeNames[scope],
    keyword: KeywordName[keyword],
    column: {
      start: colStart,
      end: colEnd
    },
    line: {
      start: lineStart,
      end: lineEnd
    }
  };
};
if (typeof WeakRef !== "undefined") {
  Object.defineProperty(astNodeBase, "parent", {
    get() {
      return this._parent && this._parent.deref();
    },
    set(parent) {
      if (parent) {
        return this._parent = new WeakRef(parent);
      } else {
        return this._parent = null;
      }
    }
  });
}
if (false) {
  Object.defineProperty(astNodeBase, "k", {
    get() {
      return ASTNodeKeyword[this.keyword];
    }
  });
  astNodeBase.original = function(source) {
    return source.substring(this.from, this.to);
  };
}
const charTypes = new Uint8Array(255);
const emptyCharTypes = new Uint8Array(255);
const incrementLineNumber = new Uint8Array(255);
var ControlIdentifier;
(function(ControlIdentifier2) {
  ControlIdentifier2[ControlIdentifier2["invalid"] = 0] = "invalid";
  ControlIdentifier2[ControlIdentifier2["inline"] = 1] = "inline";
  ControlIdentifier2[ControlIdentifier2["export"] = 2] = "export";
  ControlIdentifier2[ControlIdentifier2["build"] = 3] = "build";
  ControlIdentifier2[ControlIdentifier2["run"] = 4] = "run";
  ControlIdentifier2[ControlIdentifier2["closeScope"] = 5] = "closeScope";
  ControlIdentifier2[ControlIdentifier2["interpolate"] = 6] = "interpolate";
})(ControlIdentifier || (ControlIdentifier = {}));
const Keywords = {
  run: {
    start: "run",
    scope: true,
    inline: true,
    variableMapper: true,
    name: false,
    arguments: false,
    prefixCode: "r".charCodeAt(0)
  },
  build: {
    start: "build",
    scope: true,
    inline: true,
    variableMapper: true,
    name: false,
    arguments: false,
    prefixCode: "b".charCodeAt(0)
  },
  export: {
    start: "export",
    scope: true,
    inline: false,
    variableMapper: false,
    name: true,
    arguments: true,
    prefixCode: "e".charCodeAt(0)
  },
  inline: {
    start: "inline",
    scope: false,
    inline: true,
    variableMapper: true,
    name: false,
    arguments: false,
    prefixCode: "i".charCodeAt(0)
  }
};
const controlIdentifierTypes = new Uint8Array(255);
const controlIdentifierSkipLength = new Uint8Array(8);
const operationsByControlIdentifier = new Uint8Array(8);
const keywordNames = new Array(6);
function getControlIdentifier(code, position) {
  if (code[position + 1] === "e" && code[position + 2] === "n") {
    return 5;
  } else {
    return controlIdentifierTypes[code.charCodeAt(position + 1)];
  }
}
emptyCharTypes.fill(0);
emptyCharTypes[1] = 1;
emptyCharTypes[13] = 1;
controlIdentifierTypes[Keywords.inline.prefixCode] = 1;
controlIdentifierTypes[Keywords.run.prefixCode] = 4;
controlIdentifierTypes[Keywords.build.prefixCode] = 3;
controlIdentifierTypes[Keywords.export.prefixCode] = 2;
controlIdentifierTypes["(".charCodeAt(0)] = 6;
charTypes[`"`.charCodeAt(0)] = 12;
charTypes[`'`.charCodeAt(0)] = 12;
charTypes["`".charCodeAt(0)] = 12;
controlIdentifierSkipLength[1] = "inline".length;
controlIdentifierSkipLength[4] = "run".length;
controlIdentifierSkipLength[3] = "build".length;
controlIdentifierSkipLength[6] = "(".length;
controlIdentifierSkipLength[2] = "export function".length;
controlIdentifierSkipLength[5] = "end".length;
keywordNames[1] = "inline";
keywordNames[4] = "run";
keywordNames[3] = "build";
keywordNames[2] = "export function";
keywordNames[5] = "end";
keywordNames[6] = "(";
operationsByControlIdentifier.fill(2);
operationsByControlIdentifier[0] = 0;
operationsByControlIdentifier[2] = 7;
operationsByControlIdentifier[6] = 4;
const keywordTypes = new Uint8Array(8);
keywordTypes[1] = 4;
keywordTypes[4] = 1;
keywordTypes[3] = 2;
keywordTypes[6] = 7;
keywordTypes[2] = 3;
incrementLineNumber[13] = 1;
const backtrackAmount = new Int8Array(16);
backtrackAmount[13] = -1;
backtrackAmount[1] = -1;
for (let code = 0; code < 256; code++) {
  if (code > 64 && code < 91 || code > 96 && code < 123) {
    charTypes[code] = 3;
  } else if (code === "$".charCodeAt(0)) {
    charTypes[code] = 2;
  } else if (code === "\n".charCodeAt(0)) {
    charTypes[code] = 13;
  } else if (code === " ".charCodeAt(0)) {
    charTypes[code] = 1;
  } else if (code === "@".charCodeAt(0)) {
    charTypes[code] = 4;
  } else if (code === "(".charCodeAt(0)) {
    charTypes[code] = 10;
  } else if (code === ")".charCodeAt(0)) {
    charTypes[code] = 11;
  } else if (code === "<".charCodeAt(0)) {
    charTypes[code] = 7;
  } else if (code === ",".charCodeAt(0)) {
    charTypes[code] = 9;
  } else if (code === ">".charCodeAt(0)) {
    charTypes[code] = 8;
  } else {
  }
}
var ParseErrorType;
(function(ParseErrorType2) {
  ParseErrorType2[ParseErrorType2["invalidKeyword"] = 0] = "invalidKeyword";
  ParseErrorType2[ParseErrorType2["invalidExportFunction"] = 1] = "invalidExportFunction";
  ParseErrorType2[ParseErrorType2["strayOpenBrace"] = 2] = "strayOpenBrace";
})(ParseErrorType || (ParseErrorType = {}));
const ParseErrorNames = {
  [2]: "Invalid {",
  [0]: "Invalid keyword",
  [1]: "Invalid export function"
};
class AtbuildParseError extends Error {
  constructor(type, name, message) {
    super(message);
    this.name = name;
    this.type = type;
  }
}
function buildAST(code, filename = "file.tsb") {
  const root = Object.create(astNodeBase);
  let sourceNode;
  let position = 0, cursor = 0, operation = 0, controlIdentifierType = 0, prevCursor = cursor, line = 0, column = 0, skipLength = 0, parent = root, replacerNode, keywordNode, inlineDepthCount = 0, scopeDepthCount = 0, inlineStart = 0, nameStart = 0, variableMapOpenerStart = 0, variableMapArgumentStart = 0, lastNode, endOfPreviousLine = 0, endOfPreviousLineColumn = 0, isLineEmpty = 1, inlineEnd = 0, replacerStart = 0;
  root.children = [];
  root.keyword = 6;
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
    if (operation === 0 && cursor === 4 && (prevCursor !== 12 || controlIdentifierTypes[code.charCodeAt(position + 1)])) {
      controlIdentifierType = getControlIdentifier(code, position);
      skipLength = controlIdentifierSkipLength[controlIdentifierType] | 0;
      if (controlIdentifierType === 0 || keywordNames[controlIdentifierType] !== code.substring(position + 1, position + skipLength + 1)) {
        throw new AtbuildParseError(0, `Invalid @ keyword in ${filename}:${line}:${column - 1}`, `Invalid @ keyword in ${filename}:${line}:${column - 1}. Must be @run, @build, @export function $, @inline, @(buildCode), or @end. Received "${code.substring(position).split(" ")[0].slice(0, 10).replace("\n", "\\n")}"
`);
      } else if (controlIdentifierType === 5) {
        keywordNode.to = position;
        keywordNode.lineEnd = line - 1;
        keywordNode.colEnd = endOfPreviousLineColumn;
        keywordNode.scope = 2;
        if (sourceNode) {
          sourceNode.to = parent.to = keywordNode.to;
          sourceNode.lineEnd = parent.lineEnd = line - 1;
          sourceNode.colEnd = parent.colEnd = endOfPreviousLineColumn;
          sourceNode.parent = parent;
          if (sourceNode.value.length && !keywordNode.children.includes(sourceNode)) {
            keywordNode.children.push(sourceNode);
          }
          sourceNode = null;
        }
        keywordNode = parent || root;
        parent = keywordNode.parent || root;
        scopeDepthCount = 0;
        operation = 0;
      } else {
        operation = operationsByControlIdentifier[controlIdentifierType];
        if (sourceNode) {
          sourceNode.colEnd = column;
          sourceNode.lineEnd = line;
          sourceNode.to = position;
          sourceNode = null;
        }
        variableMapOpenerStart = variableMapArgumentStart = inlineStart = 0;
        keywordNode = Object.create(astNodeBase);
        keywordNode.children = [];
        keywordNode.from = position;
        keywordNode.colStart = column;
        keywordNode.lineStart = line;
        keywordNode.keyword = keywordTypes[controlIdentifierType];
        if (keywordNode.keyword === 3) {
          keywordNode.parent = parent = root;
        } else {
          keywordNode.parent = parent;
        }
        if (operation === 4) {
          inlineStart = position + 2;
          sourceNode = Object.create(astNodeBase);
          sourceNode.lineStart = line;
          sourceNode.from = inlineStart;
          sourceNode.parent = keywordNode;
          sourceNode.colStart = column;
        }
      }
      position += skipLength;
    } else if (operation === 2 && cursor === 7) {
      variableMapOpenerStart = position;
      variableMapArgumentStart = position + 1;
      operation = 3;
      lastNode = keywordNode;
    } else if (operation === 3 && cursor === 9) {
      lastNode = keywordNode;
      variableMapArgumentStart = position + 1;
      (keywordNode.variableMapping || (keywordNode.variableMapping = [])).push(code.substring(variableMapArgumentStart, position).trim());
    } else if (operation === 3 && cursor === 8) {
      lastNode = keywordNode;
      if (position - 1 !== variableMapArgumentStart) {
        (keywordNode.variableMapping || (keywordNode.variableMapping = [])).push(code.substring(variableMapArgumentStart, position - 1).trim());
      }
      operation = 2;
      variableMapOpenerStart = variableMapArgumentStart = inlineStart = 0;
    } else if (operation === 2 && cursor === 10 && keywordNode.keyword === 3) {
      lastNode = keywordNode;
      inlineStart = position;
      operation = 4;
      inlineDepthCount = 0;
      keywordNode.scope = 2;
    } else if (operation === 2 && cursor === 13 && (keywordNode.keyword === 2 || keywordNode.keyword === 1) && keywordNode.scope === 0) {
      operation = 0;
      lastNode = keywordNode;
      keywordNode.scope = 2;
      parent.children.push(keywordNode);
      parent = keywordNode;
      sourceNode = null;
    } else if (operation === 2 && cursor === 10 && keywordNode.keyword !== 3) {
      lastNode = keywordNode;
      inlineStart = position;
      operation = 4;
      inlineDepthCount = 0;
      keywordNode.scope = 1;
      sourceNode = Object.create(astNodeBase);
      sourceNode.from = position + 1;
      sourceNode.parent = keywordNode;
      sourceNode.colStart = column;
      sourceNode.lineStart = line;
    } else if (operation === 4 && cursor === 10) {
      lastNode = keywordNode;
      inlineDepthCount++;
    } else if (operation === 4 && cursor === 11 && inlineDepthCount > 0) {
      lastNode = keywordNode;
      inlineDepthCount--;
    } else if (operation === 4 && cursor === 11 && inlineDepthCount === 0 && keywordNode.keyword !== 3) {
      lastNode = keywordNode;
      keywordNode.lineEnd = keywordNode.lineStart = line;
      keywordNode.to = position;
      keywordNode.colEnd = column;
      keywordNode.parent = parent;
      keywordNode.scope = 1;
      if (sourceNode) {
        sourceNode.to = position;
        sourceNode.parent = keywordNode;
        keywordNode.children = [sourceNode];
        sourceNode = null;
      }
      (parent.children || (parent.children = [])).push(keywordNode);
      keywordNode = parent;
      operation = 0;
      sourceNode = Object.create(astNodeBase);
      sourceNode.from = position + 1;
      sourceNode.parent = keywordNode;
      keywordNode.children.push(sourceNode);
    } else if (operation === 4 && cursor === 11 && inlineDepthCount === 0 && keywordNode.keyword === 3) {
      lastNode = keywordNode;
      keywordNode.value = code.substring(inlineStart + 1, position);
      keywordNode.lineStart = line;
      operation = 0;
      root.children.push(keywordNode);
      keywordNode.parent = root;
      inlineEnd = position + 1;
      parent = keywordNode;
    } else if (cursor === 13 && parent.keyword === 3 && line - 1 === parent.lineStart) {
      parent.functionDeclarationSuffix = code.substring(inlineEnd, position);
      if (parent.functionDeclarationSuffix.length && parent.functionDeclarationSuffix.lastIndexOf("{") === parent.functionDeclarationSuffix.length - 1) {
        throw new AtbuildParseError(2, `Unnecessary { at ${line - 1}:${endOfPreviousLineColumn} in ${filename}`, `@export function should not have "{" or "}" at the start or end, it will be added at build-time. Use @end at the end.`);
      }
    } else if (operation === 0 && cursor === 2) {
      replacerStart = position;
      operation = 5;
      lastNode = keywordNode;
    } else if (operation === 5 && cursor !== 3 && position - replacerStart > 0 && sourceNode) {
      replacerNode = Object.create(astNodeBase);
      replacerNode.value = code.substring(replacerStart, position);
      replacerNode.from = replacerStart;
      replacerNode.to = position - 1;
      replacerNode.parent = sourceNode;
      (sourceNode.children || (sourceNode.children = [])).push(replacerNode);
      operation = 0;
      lastNode = sourceNode;
    } else if (operation === 7 && cursor !== 3 && cursor !== 1 && cursor !== 2) {
      throw new AtbuildParseError(1, `Invalid @export function`, `"@export function" must have a name that starts with "$" on the same line (${line}:${column} in ${filename})`);
    } else if (operation === 7 && cursor === 2) {
      nameStart = position;
      operation = 8;
      lastNode = keywordNode;
    } else if (operation === 8 && (cursor === 1 || cursor === 13)) {
      operation = 8;
      keywordNode.name = code.substring(nameStart, position);
      operation = 2;
      lastNode = keywordNode;
    } else if (operation === 8 && cursor === 10) {
      operation = 8;
      keywordNode.name = code.substring(nameStart, position);
      operation = 4;
      inlineStart = position;
      lastNode = keywordNode;
    } else if (operation === 0 && cursor !== 1 && cursor !== 13 && !isLineEmpty && !sourceNode && !(keywordNode && keywordNode.keyword === 3 && line === keywordNode.lineStart)) {
      lastNode = sourceNode = Object.create(astNodeBase);
      sourceNode.children = [];
      sourceNode.keyword = 0;
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
  return root;
}
function transformAST(root, code) {
  let source = `var _this = {["${PARTIAL_SOURCE_CODE_VARIABLE}"]: ""};
`;
  let needsRootSource = false;
  for (let i = 0; i < root.children.length; i++) {
    if (!needsRootSource && root.children[i].keyword !== 3) {
      needsRootSource = true;
    }
    source += visit(root.children[i], i, root, true, code);
  }
  if (needsRootSource) {
    if (!(source[source.length - 1] === ";" || source[source.length - 2] === ";" && source[source.length - 1] === "\n")) {
      source += ";";
    }
    source += `
module.exports.default = ${SOURCE_CODE_VARIABLE};
${SOURCE_CODE_VARIABLE} = "";
`;
  }
  return source;
}
const PARTIAL_SOURCE_CODE_VARIABLE = "___source___";
const SOURCE_CODE_VARIABLE = `_this.${PARTIAL_SOURCE_CODE_VARIABLE}`;
const REPLACERS_VARIABLE = "___replacers___";
function visit(node, i, parent, trailingNewline = true, input) {
  let functionName = `${ASTNodeKeyword[node.keyword]}___${node.lineStart}_${node.colStart}__${node.lineEnd}_${node.colEnd}`;
  let source = "";
  switch (node.keyword) {
    case 7: {
      switch (parent.keyword) {
        case 2:
        case 3:
        case 6: {
          node.keyword = 1;
          return visit(node, i, parent, trailingNewline, input);
        }
        case 1: {
          node.keyword = 2;
          return visit(node, i, parent, trailingNewline, input);
        }
        default:
          throw "Invalid input";
      }
    }
    case 2: {
      if (node.scope === 1) {
        if (node.parent && node.parent.keyword === 1) {
          source += `${SOURCE_CODE_VARIABLE} += (`;
        }
        if (node.children) {
          for (let child of node.children) {
            source += visit(child, i + 1, node, false, input);
          }
        }
      } else if (node.scope === 2 && parent.keyword !== 6) {
        if (node.children) {
          for (let child of node.children) {
            source += visit(child, i + 1, node, trailingNewline, input);
          }
        }
      } else if (node.scope === 2 && parent.keyword === 6) {
        if (node.children) {
          for (let child of node.children) {
            source += visit(child, i + 1, node, trailingNewline, input);
          }
        }
      } else {
        throw "Not implemented";
      }
      if (node.scope === 1 && parent && parent.keyword === 1) {
        source += `);`;
      }
      break;
    }
    case 3: {
      source += `
;var ${node.name} = (module.exports.${node.name} = (function ${node.name}(${node.value.trim().split(",").join(", ")})${node.functionDeclarationSuffix} {
        let originalThis = _this;

        if (!this || typeof this["${PARTIAL_SOURCE_CODE_VARIABLE}"] === 'undefined') {
          _this = {
            ["${PARTIAL_SOURCE_CODE_VARIABLE}"]: ""
          }
        } else {
          _this = this;
        }

        const buildEval = (function ${functionName}() {
`;
      if (node.children) {
        for (let child of node.children) {
          source += visit(child, i + 1, node, trailingNewline, input);
        }
      }
      source += `
})();
    let output = ${SOURCE_CODE_VARIABLE};
    _this = originalThis;
  return typeof buildEval === 'undefined' ? output : buildEval;
}));

`;
      break;
    }
    case 4: {
      throw "Not implemented yet";
      break;
    }
    case 1: {
      if (node.children) {
        for (let child of node.children) {
          source += visit(child, i + 1, node, trailingNewline, input);
        }
      }
      break;
    }
    case 0: {
      let value = input.substring(node.from, Math.min(node.to, input.length));
      if (parent.keyword === 2 || parent.keyword === 3 || parent.keyword === 4) {
        return trailingNewline ? value : value.trimEnd();
      } else if (parent.keyword === 1 || parent.keyword === 6) {
        if (node.children && node.children.length && parent && parent.variableMapping && parent.variableMapping.length) {
          const slottedValue = [value];
          let replacerIndex = -1;
          let slotOffset = 0;
          let positionOffset = node.from;
          let position = 0;
          for (let i2 = 0; i2 < node.children.length; i2++) {
            const replacer = node.children[i2];
            replacerIndex = parent.variableMapping.indexOf(replacer.name);
            if (replacerIndex === -1) {
              continue;
            }
            slottedValue.length += 2;
            slottedValue[slotOffset++] = value.substring(position - positionOffset, replacer.from - positionOffset);
            slottedValue[slotOffset++] = `" + ${REPLACERS_VARIABLE}[${replacerIndex}] + "`;
            slottedValue[slotOffset++] = value.substring(replacer.to - positionOffset + 1);
          }
          value = slottedValue.join("");
        }
        source += `${SOURCE_CODE_VARIABLE} += "${value.replace(/\n/gm, "\\n").replace(/"/gm, '\\"')}";${trailingNewline ? "\n" : ""}`;
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
export default require_atbuild();
//# sourceMappingURL=atbuild.js.map
