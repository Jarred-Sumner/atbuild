"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var path = _interopRequireWildcard(require("path"));

var _vscode = require("vscode");

var _vscodeLanguageclient = require("vscode-languageclient");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// @ts-ignore
let client;

function activate(context) {
  const {
    AtBuild
  } = require("./atbuild"); // The server is implemented in node


  let serverModule = context.asAbsolutePath(path.join("server", "out", "server.js")); // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging

  let debugOptions = {
    execArgv: ["--nolazy", "--inspect=6009"]
  }; // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used

  let serverOptions = {
    run: {
      module: serverModule,
      transport: _vscodeLanguageclient.TransportKind.ipc
    },
    debug: {
      module: serverModule,
      transport: _vscodeLanguageclient.TransportKind.ipc,
      options: debugOptions
    }
  };
  const virtualDocumentContents = new Map();

  _vscode.workspace.registerTextDocumentContentProvider("embedded-content", {
    provideTextDocumentContent: uri => {
      const originalUri = uri.path.slice(1).slice(0, -3);
      const decodedUri = decodeURIComponent(originalUri);
      return virtualDocumentContents.get(decodedUri);
    }
  });

  let response = ["", AtBuild.ASTResponseType.BuildtimeCode, 0, 0];
  let clientOptions = {
    documentSelector: [{
      scheme: "file",
      language: "buildjs"
    }],
    middleware: {
      provideCompletionItem: async (document, position, context, token, next) => {
        AtBuild.extractSourceAndType(document.getText(), document.uri, position.line - 1, position.character, response);
        const originalUri = document.uri.toString();
        virtualDocumentContents.set(originalUri, response[0]);
        const vdocUriString = `embedded-content://${response[1]}/${encodeURIComponent(originalUri)}.ts`;

        const vdocUri = _vscode.Uri.parse(vdocUriString);

        return await _vscode.commands.executeCommand("vscode.executeCompletionItemProvider", vdocUri, position, context.triggerCharacter);
      }
    }
  }; // Create the language client and start the client.

  client = new _vscodeLanguageclient.LanguageClient("languageServerExample", "Language Server Example", serverOptions, clientOptions); // Start the client. This will also launch the server

  client.start();
}

function deactivate() {
  if (!client) {
    return undefined;
  }

  return client.stop();
}