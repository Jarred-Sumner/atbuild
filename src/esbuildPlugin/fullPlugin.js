const util = require("util");
const fs = require("fs");
const { AtBuild } = require("../atbuild");

module.exports = (plugin) => {
  const readFile = util.promisify(fs.readFile);

  plugin.setName("AtBuildFull");

  plugin.addLoader({ filter: /\.(@js|jsb|tsb|@ts)$/ }, async (args) => {
    const source = await readFile(args.path, "utf8");
    const contents = AtBuild.transformAST(
      AtBuild.buildAST(source, args.path),
      source
    );

    return {
      contents,
    };
  });

  return plugin;
};
