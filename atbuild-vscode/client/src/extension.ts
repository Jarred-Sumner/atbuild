import * as path from "path";
// @ts-ignore
import {
  commands,
  CompletionList,
  ExtensionContext,
  Uri,
  workspace,
} from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const { AtBuild } = require("./atbuild");

  // The server is implemented in node
  let serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );
  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  let serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  const virtualDocumentContents = new Map<string, string>();

  workspace.registerTextDocumentContentProvider("embedded-content", {
    provideTextDocumentContent: (uri) => {
      const originalUri = uri.path.slice(1).slice(0, -3);
      const decodedUri = decodeURIComponent(originalUri);
      return virtualDocumentContents.get(decodedUri);
    },
  });
  let response = ["", AtBuild.ASTResponseType.BuildtimeCode, 0, 0];

  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "buildjs" }],
    middleware: {
      provideCompletionItem: async (
        document,
        position,
        context,
        token,
        next
      ) => {
        AtBuild.extractSourceAndType(
          document.getText(),
          document.uri,
          position.line - 1,
          position.character,
          response
        );

        console.log("PROVIDE COMPLETIONS!!!");
        const originalUri = document.uri.toString();
        virtualDocumentContents.set(originalUri, response[0]);

        const vdocUriString = `embedded-content://${
          response[1]
        }/${encodeURIComponent(originalUri)}.ts`;
        const vdocUri = Uri.parse(vdocUriString);
        return await commands.executeCommand<CompletionList>(
          "vscode.executeCompletionItemProvider",
          vdocUri,
          position,
          context.triggerCharacter
        );
      },
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "languageServerExample",
    "Language Server Example",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
