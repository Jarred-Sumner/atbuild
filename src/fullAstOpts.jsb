
@@

const PRIMARY_CONTROL_CHARACTER = "@";

const CharacterType = {
  unknown: 0,
  whitespace: 1, //
  newline: 2, // \n
  alphanumeric: 3, // [a-zA-Z0-9]
  control: 4, // @
  scopeOpener: 5, // {
  scopeCloser: 6, // }
  variableMapOpener: 7, // <
  variableMapCloser: 8, // >
  variableMapSeparator: 9, // ,
  inlineOpener: 10, // (
  inlineCloser: 11, // )
  escape: 12, // \
  replacerStart: 13, // $
}

const Keywords = {
  run: {
    start: "run",
    scope: true,
    inline: true,
    variableMapper: true,
    name: false,
    arguments: false
  },
  build: {
    start: "build",
    scope: true,
    inline: true,
    variableMapper: true,
    name: false,
    arguments: false
  },
  export: {
    start: "export",
    scope: true,
    inline: false,
    variableMapper: false,
    name: true,
    arguments: true
  },
  inline: {
    start: "inline",
    scope: false,
    inline: true,
    variableMapper: true,
    name: false,
    arguments: false
  }
}

const charTypes = new Array(255);

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
    charTypes[code] = CharacterType.ignore;
  }
}

@@

export let charTypes = new Uint8Array(@([{charTypes}]}) ;


