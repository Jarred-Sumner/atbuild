"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
exports.__esModule = true;
exports.AtBuildWebpackPlugin = void 0;
var path_1 = require("path");
var webpack = require("webpack");
var loaderDir = path_1["default"].join(__dirname, "./index.js");
var CustomModule = /** @class */ (function (_super) {
  __extends(CustomModule, _super);
  function CustomModule(mod, code) {
    if (mod === void 0) {
      mod = {};
    }
    var _this = this;
    var loaders = mod.loaders;
    for (var i = 0; i < loaders.length; i++) {
      if (loaders[i].loader === loaderDir) {
        loaders.splice(i, 1);
        break;
      }
    }
    _this =
      _super.call(
        this,
        __assign(__assign({}, mod), {
          type: ".js",
          request: mod.request + ".js",
          userRequest: mod.userRequest + ".js",
          loaders: loaders,
          generator: mod.generator,
          resolveOptions: mod.resolveOptions,
          parser: mod.parser,
        })
      ) || this;
    _this.code = code;
    _this.useSourceMap = false;
    if (mod.context) {
      _this.__source = _this.createSource(mod.context, code);
    } else {
      _this.__source = _this.createSource(_this.context || "test.js", code);
    }
    return _this;
  }
  Object.defineProperty(CustomModule.prototype, "_source", {
    get: function () {
      return this.__source;
    },
    set: function (v) {
      // return this.__source;
    },
    enumerable: false,
    configurable: true,
  });
  // source(dependencyTemplates, runtimeTemplate) {}
  CustomModule.prototype.updateHash = function (hash, context) {};
  return CustomModule;
})(webpack.NormalModule);
var AtBuildWebpackPlugin = /** @class */ (function () {
  function AtBuildWebpackPlugin(resourcePath, code) {
    this.resourcePath = resourcePath;
    this.code = code;
  }
  AtBuildWebpackPlugin.prototype.apply = function (compiler) {
    var _this = this;
    var asset = this.resourcePath;
    var hasSet = false;
    compiler.hooks.compilation.tap("AtBuildWebpackPlugin", function (
      compilation,
      _a
    ) {
      // compilation.dependencyFactories.set(
      //   AtBuildDependency,
      //   normalModuleFactory
      // );
      // compilation.dependencyTemplates.set(
      //   AtBuildDependency,
      //   new AtBuildDependency.Template()
      // );
      var normalModuleFactory = _a.normalModuleFactory;
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
      normalModuleFactory.hooks.module.tap("AtBuildPlugin", function (
        module,
        opts,
        arg2
      ) {
        if (opts.resource === asset) {
          var resolved = "'use strict';\n" + _this.code;
          return new CustomModule(opts, resolved);
        }
        return module;
      });
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
    });
    // compiler.hooks.normalModuleFactory.tap("AtBuildWebpackPlugin", (nmf) => {
    //   // nmf.hooks.module.tap("AtBuildWebpackPlugin", (mod) => {
    //   //   console.log(mod);
    //   //   debugger;
    //   //   return mod;
    //   // });
    // });
  };
  return AtBuildWebpackPlugin;
})();
exports.AtBuildWebpackPlugin = AtBuildWebpackPlugin;
