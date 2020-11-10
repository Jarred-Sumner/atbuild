const util = require("util");
const fs = require("fs");
const { buildAST, transformAST } = require("../light");
const readFile = util.promisify(fs.readFile);

const filter = { filter: /\.(atbuild)$/ };

async function onLoad(args) {
  let source = await readFile(args.path, "utf8");
  let contents = transformAST(buildAST(source));
  source = null;
  return {
    contents: `module.exports.default = ${contents}`,
  };
}

module.exports = {
  name: "AtBuildLight",
  setup(build) {
    build.onLoad(filter, onLoad);
  },
};
