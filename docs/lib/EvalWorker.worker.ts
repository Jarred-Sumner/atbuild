// Start the esbuild web worker once
import { startService, Service } from "esbuild-wasm";
import { format } from "prettier/standalone";
import parserBabel from "prettier/parser-babel";

const lodash = require("lodash");

let service: Service, isStartingService;
let cb = null;

async function getService(): Promise<Service> {
  if (!service && !isStartingService) {
    isStartingService = true;
    service = await startService({
      wasmURL: "/eval/esbuild.wasm",
      worker: true,
    });

    if (cb) {
      cb(service);
    }
  } else if (!service) {
    return new Promise((resolve) => {
      cb = resolve;
    });
  } else {
    return service;
  }
}

getService();

function evalCode(code: string, ast) {
  return (function () {
    this.module = {
      exports: {},
      require: function (id) {
        if (id === "lodash") {
          return lodash;
        } else {
          throw "RequireError module not found " + id;
        }
      },
    };

    eval.apply(this, [
      `var require = this.module.require; var module = this.module;\n` + code,
    ]);
    let output: string = "";
    switch (typeof this.module.exports.default) {
      case "number":
      case "string":
        output = this.module.exports.default.toString();
        break;
      case "function":
        output = this.module.exports.default.toString();
        break;
    }

    for (let child of ast.children) {
      if (child.keyword === "export") {
        output += `\nexport function ${child.name}(${child.value}) {
// Placeholder function that will be run & replaced at buildtime
        }\n`;
      }
    }
    return output;
  })();
}

const processCode = async function (code, ast) {
  const service = await getService();
  const result = await service.transform(code, {
    target: "esnext",
    loader: "tsx",
    format: "cjs",
  });

  var source = result.code;
  if (source instanceof Uint8Array) {
    source = new TextDecoder().decode(source, { stream: false });
  }

  let runtime, error;
  try {
    if (result.code.length) {
      runtime = evalCode(source, ast);
    }
  } catch (exception) {
    error = exception;
  }

  if (runtime) {
    try {
      runtime = format(runtime, { plugins: [parserBabel] });
    } catch (exception) {
      throw exception;
    }
  }

  return {
    transformedCode: result.code,
    code: runtime,
    error,
    warnings: result.warnings,
  };
};

self.addEventListener("message", ({ data }) => {
  if (data.code) {
    processCode(data.code, data.ast).then(
      (result) => self.postMessage(result),
      (err) => {
        console.error(err);
      }
    );
  }
});
