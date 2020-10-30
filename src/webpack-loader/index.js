import { AtBuild, requireFromString } from "../atbuild";
import { buildSync } from "esbuild";
import path from "path";

let esbuildInput = {
  stdin: {
    contents: "",
    resolveDir: "",
    sourcefile: "",
    loader: "ts",
  },
  format: "cjs",
  target: [`node${process.versions.node.split(".")[0]}`],
  sourcemap: "inline",
  bundle: true,
  write: false,
};
let textDecoder = new TextDecoder("utf-8");

export default function loader(_code) {
  // this.cacheable(false);

  const code = AtBuild.transformAST(
    AtBuild.buildAST(
      _code
      // this._compilation.inputFileSystem.readFileSync(this.resourcePath, "utf8")
    ),
    false
  );

  esbuildInput.stdin.contents = code;
  esbuildInput.stdin.resolveDir = this._compilation.compiler.context;
  esbuildInput.stdin.sourcefile = path.basename(this.resourcePath) + ".js";
  const result = buildSync(esbuildInput);

  return requireFromString(
    textDecoder.decode(result.outputFiles[0].contents),
    this.resourcePath
  );

  // const workerContext = {};
  // const filename = this.resourcePath;
  // workerContext.options = {
  //   filename,
  //   chunkFilename: "atbuild.chunk.js",
  //   module: false,
  //   library: "atbuild",
  //   target: "node",
  //   libraryTarget: "commonjs",
  //   enabledLibraryTypes: ["commonjs"],
  //   // publicPath,
  //   // globalObject: "self",
  //   // minimize: false,
  //   // target: "node",
  // };

  // const compiler = compilation.createChildCompiler(
  //   `atbuild-loader !!${filename}`,
  //   workerContext.options,
  //   []
  // );
  // new NodeTargetPlugin().apply(compiler);
  // new SingleEntryPlugin(
  //   compiler.context,
  //   `!!${this.request}`,
  //   path.parse(filename).name
  // ).apply(compiler);

  // new DefinePlugin({
  //   "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  //   "typeof window": JSON.stringify(undefined),
  //   "typeof document": JSON.stringify(undefined),
  // }).apply(compiler);

  // compiler.options.optimization = false;
  // Object.assign(compiler.options.output, workerContext.options);
  // compiler.options.amd = false;
  // compiler.options.target = "node";
  // // compiler.(filename, code);

  // // debugger;

  // new AtBuildWebpackPlugin(filename, code).apply(compiler);

  // return compiler.runAsChild((err, entries, compilation) => {
  //   if (err) {
  //     callback(err);
  //   } else {
  //     let bundled = compilation.assets[
  //       [...entries[0].files.keys()][0]
  //     ].source();

  //     let lines = bundled.split("\n");
  //     let requireLineI = lines.length - 1;
  //     for (; requireLineI > 0; requireLineI--) {
  //       if (lines[requireLineI].indexOf("// Load entry module") > -1) {
  //         requireLineI++;
  //         break;
  //       }
  //     }
  //     lines[requireLineI] = lines[requireLineI].replace(
  //       "__webpack_require__",
  //       "module.exports = __webpack_require__"
  //     );
  //     lines.length = requireLineI + 1;
  //     lines.shift();
  //     bundled = lines.join("\n");
  //     lines = null;

  //     bundled = requireFromString(bundled, filename + ".js");

  //     callback(null, bundled, {
  //       version: "3",
  //       sources: [this.resourcePath],
  //       file: this.resourcePath,
  //       sourcesContent: [],
  //       mappings: "",
  //     });
  //   }
  // });
}

// export function pitch(req, prev, data) {
//   const source = this._compilation.inputFileSystem.readFileSync(req, "utf8");
//   data.code = AtBuild.transformAST(AtBuild.buildAST(source));
// }

// export function pitch() {
// const workerContext = {};
// const filename = path.join(
//   path.dirname(this.request, path.basename(this.request) + ".js")
// );

// workerContext.options = {
//   filename,
//   chunkFilename: "atbuild.chunk.js",
//   // publicPath,
//   // globalObject: "self",
// };

// const ast = AtBuild.buildAST(source);
// const code = AtBuild.transformAST(ast);

// const compiler = compilation.createChildCompiler(
//   `atbuild-loader ${this.request}`,
//   workerContext.options
// );
// new NodeTargetPlugin().apply(compiler);

// new SingleEntryPlugin(
//   this.context,
//   filename,
//   path.parse(filename).name
// ).apply(compiler);

// new AtBuildWebpackPlugin(filename, code).apply(compiler);

// return compiler.runAsChild((err, entries, compilation) => {
//   if (err) {
//     callback(err);
//   } else {
//     const ok = compilation.assets[[...entries[0].files.keys()][0]].source();
//     debugger;
//     callback(null, ok);
//   }
// });
// }
