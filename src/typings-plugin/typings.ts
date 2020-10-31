// // tslint:disable:no-console no-any
// import * as os from "os";
// import chalk from "chalk";
// import * as fs from "fs";
// import * as glob from "glob";
// import { Plugin as PostCssPlugin } from "postcss";
// import { Tapable } from "tapable";
// import { promisify } from "util";
// import { Compiler } from "webpack";
// import { generateTypings } from "./generateTypings";

// export interface Options {
//   compilerOptions?: {};
// }

// export class AtBuildTypingsPlugin implements Tapable.Plugin {
//   constructor({ compilerOptions = {} }: Options = {}) {
//     this.compilerOptions = {
//       ...(compilerOptions || {}),
//       noEmit: false,
//       noEmitOnError: false,
//       declaration: true,
//       declarationMap: false,
//       allowJs: true,
//       emitDeclarationOnly: true,
//     };
//   }

//   readFile = (name: string) => {
//     return this._typableAssets.get(name);
//   };

//   writeFile = (name: string, content: string) => {
//     return fs.promises.writeFile(name, content, "utf8");
//   };

//   compilerOptions = {};

//   _typableAssets: Map<string, string> = new Map();

//   apply(compiler: Compiler) {
//     compiler.hooks.afterEmit.tapPromise(
//       "AtBuildTypingsPlugin",
//       async (compilation) => {
//         const keys = [];
//         for (let asset of compilation.moduleGraph.get()) {
//           if (asset.name.includes(".jsb") || asset.name.includes(".@js")) {
//             keys.push(asset.name);
//             this._typableAssets.set(asset.name, asset.source.source());
//           }
//         }

//         debugger;

//         if (keys.length > 0) {
//           await generateTypings(
//             [...keys],
//             this.compilerOptions,
//             this.readFile,
//             this.writeFile
//           );
//         }
//       }
//     );
//     // CAVEAT: every time CSS changes, the watch-run is triggered twice:
//     // - one because CSS changes
//     // - one because .css.d.ts is added
//     // compiler.hooks.watchRun.tapPromise("TypedCssModulesPlugin", async () => {
//     //   try {
//     //     // first time this event is triggered, we do a full build instead of incremental build.
//     //     await this.generateCssTypings(this.useIncremental);
//     //   } catch (err) {
//     //     console.log(chalk.bold.red(err.toString()));
//     //   } finally {
//     //     this.useIncremental = true;
//     //   }
//     // });
//   }
// }
