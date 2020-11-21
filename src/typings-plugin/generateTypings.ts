import ts from "typescript";

export let baseTypings = {
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
    "**/*.tsb": "TS",
  },
};
export function generateTypings(
  filenames: string[],
  options: any,
  readFile: (fileName: string) => string | undefined,
  writeFile: (fileName: string, content: string) => void
): void {
  // Create a Program with an in-memory emit
  const host = ts.createCompilerHost(options);
  host.writeFile = writeFile;
  host.readFile = readFile;

  // Prepare and emit the d.ts files
  const program = ts.createProgram(filenames, options, host);
  program.emit(undefined, undefined, undefined, true);
}
