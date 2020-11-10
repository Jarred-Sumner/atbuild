const util = require("util");
const fs = require("fs");
const { AtBuild } = require("../atbuild");
const readFile = util.promisify(fs.readFile);

async function onLoad(args) {
  let source = await readFile(args.path, "utf8");

  let contents = AtBuild.transformAST(
    AtBuild.buildAST(source, args.path),
    source
  );
  source = null;

  return {
    contents,
  };
}

const filter = { filter: /\.(@js|jsb|tsb|@ts)$/ };

module.exports = {
  name: "AtBuildFull",
  setup(build) {
    build.onLoad(filter, onLoad);
  },
};
