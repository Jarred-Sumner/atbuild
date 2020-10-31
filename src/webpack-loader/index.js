import { AtBuild, requireFromString } from "../atbuild";
import { build } from "esbuild";
import path from "path";
import esbuildPlugin from "../esbuildPlugin";

const SUPPORTED_EXTENSIONS = /\.(jsb|@js|build.js)$/;
const importPathsFromAST = (ast) => {
  const importPaths = new Set();
  for (let node of ast) {
    if (node.type === "ImportPath") importPaths.add(node.value);
  }
  return importPaths;
};

let _esbuildInput = {
  format: "cjs",
  target: [`node${process.versions.node.split(".")[0]}`],
  outfile: "out.js",
  metafile: "meta.json",
  sourcemap: "inline",
  entryPoints: [""],
  platform: "node",
  resolveExtensions: [".ts", ".js", ".tsx", ".jsx", ".jsb", ".@js"],
  bundle: true,
  write: false,
  plugins: [esbuildPlugin],
};
let textDecoder = new TextDecoder("utf-8");

function handleESBuildResult(
  { outputFiles, warnings },
  input,
  callback,
  resourcePath,
  addDependency,
  ignoreDependency
) {
  let source, meta;
  for (let outputFile of outputFiles) {
    if (outputFile.path.endsWith(input)) {
      source = textDecoder.decode(outputFile.contents);
    } else if (outputFile.path.endsWith("meta.json")) {
      meta = JSON.parse(textDecoder.decode(outputFile.contents));
    }
  }

  for (let key in meta.inputs) {
    if (key !== ignoreDependency) {
      addDependency(key);
    }
  }

  try {
    const code = requireFromString(source, input).default;

    callback(null, code, {
      version: "3",
      sources: [resourcePath],
      file: resourcePath,
      sourcesContent: [],
      mappings: "",
    });
  } catch (exception) {
    callback(exception);
  }
}

export default function loader(_code) {
  const callback = this.async();

  let esbuildInput = { ..._esbuildInput };

  esbuildInput.entryPoints = [this.resourcePath];
  esbuildInput.outfile = this.resourcePath + ".js";

  build(esbuildInput).then(
    (res) =>
      handleESBuildResult(
        res,
        esbuildInput.outfile,
        callback,
        this.resourcePath,
        this.addDependency,
        esbuildInput.entryPoints[0]
      ),
    (err) => {
      console.error(err);
      debugger;

      callback(err);
    }
  );
}
