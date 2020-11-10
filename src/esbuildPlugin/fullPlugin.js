module.exports = {
  name: "AtBuildFull",
  setup(build) {
    const util = require("util");
    const fs = require("fs");
    const { AtBuild } = require("../atbuild");
    const readFile = util.promisify(fs.readFile);

    build.onLoad({ filter: /\.(@js|jsb|tsb|@ts)$/ }, async (args) => {
      let source = await readFile(args.path, "utf8");

      let contents = AtBuild.transformAST(
        AtBuild.buildAST(source, args.path),
        source
      );
      source = null;

      return {
        contents,
      };
    });
  },
};
