const util = require("util");
const fs = require("fs");
const { bundle } = require("./bundle");
const { transformAST, buildAST } = require("./fullAst");
const path = require("path");

const readFile = util.promisify(fs.readFile);
const _writeFile = util.promisify(fs.writeFile);
const copyFile = util.promisify(fs.copyFile);

const crypto = require("crypto");
let promisesToWait = [];

function writeFile(name, content) {
  let promise = _writeFile(name.replace(".tsb.js", ""), content);

  promisesToWait.push(promise);
  return promise;
}

const TOP_TEXT = "** Code-generated with AtBuild ";
const FILLER_TEXT = `// @ts-ignore
/* eslint-disable */\n`;

const buildHeader = (filename, hash) => {
  const content = `${filename} v${hash}`;
  const lengthDiff = Math.max(50, content.length + 3);

  return `/*${TOP_TEXT.padEnd(lengthDiff - 2, "*")}
-> ${content}
${"".padStart(lengthDiff, "*")}
${FILLER_TEXT}`;
};

const exists = util.promisify(fs.exists);

const REPLACE_REGEX = /\.(@js|jsb|tsb|@ts)$/gm;
async function load(_path, outpath, resolveDir) {
  console.time(
    "[WRITE] " + path.basename(_path) + "   ➡️   " + path.basename(outpath)
  );
  let source = await readFile(_path, "utf8");
  const hasher = crypto.createHash("md5");
  hasher.update(source, "utf8");
  const hex = hasher.digest("hex");
  const header = buildHeader(path.basename(_path), hex);

  if (await exists(outpath)) {
    const target = await readFile(outpath, "utf8");

    if (target.startsWith(header)) {
      console.timeEnd(
        "[WRITE] " + path.basename(_path) + "   ➡️   " + path.basename(outpath)
      );
      source = null;
      return target;
    }
  }

  const ast = buildAST(source, _path);
  let _contents = transformAST(ast, source);
  source = null;
  const typescript = outpath.includes(".ts");
  let contents = await bundle(_contents, {
    format: "esm",
    mode: "full",
    filepath: _path,
    defaultMode: "full",
    typescript,
    service: false,
    destination: resolveDir,
    readFile: fs.readFileSync,
    writeFile: writeFile,
  });
  _contents = null;
  contents = header + contents;
  await _writeFile(outpath, contents, "utf8");
  if (outpath.includes(".d.ts")) {
    const dual = path.join(
      path.dirname(outpath),
      "_" + path.basename(outpath.replace(".d.ts", "")) + ".ts"
    );
    await copyFile(outpath, dual);
  }

  console.timeEnd(
    "[WRITE] " + path.basename(_path) + "   ➡️   " + path.basename(outpath)
  );
  return contents;
}

const getOutpath = (_path) => {
  if (path.extname(_path).includes("ts")) {
    return path.join(
      path.dirname(_path),
      path.basename(_path).replace(REPLACE_REGEX, ".d.ts")
    );
  } else {
    return path.join(
      path.dirname(_path),
      "_" + path.basename(_path).replace(REPLACE_REGEX, ".js")
    );
  }
};

async function onLoadPlugin(args) {
  const dir = path.dirname(args.path);
  const _path = args.path;
  const outpath = getOutpath(_path);

  return {
    contents: await load(_path, outpath, dir),
    loader: path.extname(_path).includes("ts") ? "ts" : "js",
  };
}

const filter = { filter: /(\.tsb|\.jsb|\.@js|\.@ts)$/ };

module.exports = {
  name: "AtbuildFull",
  setup(build) {
    build.onLoad(filter, onLoadPlugin);
  },
};
