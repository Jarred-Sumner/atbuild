const babelJest = require("babel-jest");
const { AtBuild } = require("atbuild");

module.exports = {
  process(fileContent, filePath, ...rest) {
    return babelJest.process(
      AtBuild.eval(fileContent, filePath, true),
      filePath,
      ...rest
    );
  },
};
