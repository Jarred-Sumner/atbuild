const util = require("util");
const fs = require("fs");
const { buildAST, transformAST } = require("../light");

module.exports = (plugin) => {
  const readFile = util.promisify(fs.readFile);

  plugin.setName("AtBuild Light");

  plugin.addLoader({ filter: /\.(atbuild)$/ }, async (args) => {
    const source = await readFile(args.path, "utf8");
    let contents = transformAST(buildAST(source));
    return {
      contents: `module.exports.default = ${contents}`,
    };
  });

  return plugin;
};
