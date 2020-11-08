const { AtBuild } = require("atbuild");

module.exports = {
  process(fileContent, filePath, ...rest) {
    return AtBuild.eval(fileContent, filePath, true);
  },
};
