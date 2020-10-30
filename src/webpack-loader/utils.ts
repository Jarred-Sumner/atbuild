import path from "path";
import * as webpack from "webpack";

let loaderDir = path.join(__dirname, "./index.js");
class CustomModule extends webpack.NormalModule {
  constructor(mod: webpack.NormalModule = {}, code) {
    let loaders = mod.loaders;
    for (let i = 0; i < loaders.length; i++) {
      if (loaders[i].loader === loaderDir) {
        loaders.splice(i, 1);
        break;
      }
    }

    super({
      ...mod,
      type: ".js",
      request: mod.request + ".js",
      userRequest: mod.userRequest + ".js",
      loaders,
      generator: mod.generator,
      resolveOptions: mod.resolveOptions,
      parser: mod.parser,
    });
    this.code = code;
    this.useSourceMap = false;
    if (mod.context) {
      this.__source = this.createSource(mod.context, code);
    } else {
      this.__source = this.createSource(this.context || "test.js", code);
    }
  }
  code: string;

  get _source() {
    return this.__source;
  }

  set _source(v: v) {
    // return this.__source;
  }

  // source(dependencyTemplates, runtimeTemplate) {}

  updateHash(hash, context) {}
}

export class AtBuildWebpackPlugin {
  constructor(resourcePath, code) {
    this.resourcePath = resourcePath;
    this.code = code;
  }

  apply(compiler: webpack.Compiler) {
    const asset = this.resourcePath;
    let hasSet = false;

    compiler.hooks.compilation.tap(
      "AtBuildWebpackPlugin",
      (compilation, { normalModuleFactory }) => {
        // compilation.dependencyFactories.set(
        //   AtBuildDependency,
        //   normalModuleFactory
        // );
        // compilation.dependencyTemplates.set(
        //   AtBuildDependency,
        //   new AtBuildDependency.Template()
        // );

        // let originalCreate = normalModuleFactory.create;
        // normalModuleFactory.create = function (...args) {
        //   originalCreate(...args);

        // normalModuleFactory.create(
        //   {
        //     context: asset,
        //   },
        //   new OriginalSource(this.code, asset)
        // );

        // compilation.addModule(module, callback);
        normalModuleFactory.hooks.module.tap(
          "AtBuildPlugin",
          (module, opts, arg2) => {
            if (opts.resource === asset) {
              const resolved = `'use strict';\n` + this.code;

              return new CustomModule(opts, resolved);
            }

            return module;
          }
        );

        // webpack.NormalModule.getCompilationHooks(compilation).loader.tap(
        //   "AtBuildWebpackPlugin",
        //   (ctx, module) => {
        //     module.createLoaderContext(resolver, options, compilation, fs)
        //   }
        // );
        // compilation.hooks.succeedEntry.tap("AtBuildWebpackPlugin", (entry, a) => {
        //   const mod = compilation.moduleGraph.getModule(entry);
        //   mod._source._value = this.code;
        //   debugger;
        // });

        // compilation.hooks.moduleAsset.tap("AtBuildWebpackPlugin", (mod, str) => {
        //   debugger;
        // });
        // compilation.hooks.buildModule.tap("AtBuildWebpackPlugin", (mod) => {
        //   if (mod.identifier() === asset) {
        //     compilation.moduleGraph.updateModule(virtualDep, mod);

        //     debugger;
        //   }
        // });
        // compilation.hooks.finishModules.tap("AtBuildWebpackPlugin", (mod) => {
        //   debugger;
        // });
      }
    );
    // compiler.hooks.normalModuleFactory.tap("AtBuildWebpackPlugin", (nmf) => {

    //   // nmf.hooks.module.tap("AtBuildWebpackPlugin", (mod) => {
    //   //   console.log(mod);
    //   //   debugger;

    //   //   return mod;
    //   // });
    // });
  }
}
