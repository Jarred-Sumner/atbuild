import { AtBuild } from "../atbuild";

function processResult(loaderContext, result) {
  loaderContext.cacheable(true);

  loaderContext.callback(null, result, {
    version: "3",
    sources: [loaderContext.resourcePath],
    file: loaderContext.resourcePath,
    sourcesContent: [],
    mappings: "",
  });
}

export default function loader(content) {
  let exports;

  try {
    exports = AtBuild.evalAsync(content, this.resourcePath, false, (id) => {
      return new Promise((resolve, reject) => {
        this.loadModule(id, function (err, source, sourceMap, module) {
          err ? reject(err) : resolve(source);
        });
      });
    });
  } catch (error) {
    throw new Error(`Unable to execute "${this.resource}": ${error}`);
  }

  const func = exports && exports.default ? exports.default : exports;
  let result;

  try {
    if (typeof func === "function") {
      result = func(options, this);
    } else {
      result = func;
    }
  } catch (error) {
    throw new Error(`Module "${this.resource}" throw error: ${error}`);
  }

  if (result && typeof result.then === "function") {
    const callback = this.async();
    result
      .then((res) => processResult(this, res))
      .catch((error) => {
        callback(new Error(`Module "${this.resource}" throw error: ${error}`));
      });
    return;
  }

  processResult(this, result);
}
