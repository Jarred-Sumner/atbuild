"use strict";
exports.__esModule = true;
exports.generateTypings = exports.baseTypings = void 0;
var ts;
exports.baseTypings = {
    noEmit: false,
    noEmitOnError: false,
    declaration: true,
    declarationMap: false,
    allowJs: true,
    skipLibCheck: true,
    strict: false,
    downlevelIteration: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    jsx: "preserve",
    emitDeclarationOnly: true,
    extensions: {
        "**/*.ts": "TS",
        "**/*.js": "JS",
        "**/*.jsb": "JS",
        "**/*.@js": "JS",
        "**/*.@ts": "TS",
        "**/*.tsb": "TS"
    }
};
function generateTypings(filenames, options, readFile, writeFile) {
    if (!ts) {
        ts = require("typescript");
    }
    // Create a Program with an in-memory emit
    var host = ts.createCompilerHost(options);
    host.writeFile = writeFile;
    host.readFile = readFile;
    // Prepare and emit the d.ts files
    var program = ts.createProgram(filenames, options, host);
    return program.emit(undefined, undefined, undefined, true);
}
exports.generateTypings = generateTypings;
