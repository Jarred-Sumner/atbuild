const fs = require("fs");
const path = require("path");
const { runLoaders } = require("loader-runner");

export function webpack(file) {
  return new Promise((resolve, reject) => {
    runLoaders(
      {
        resource: file,
        loaders: [path.resolve(__dirname, "../src/webpack-loader")],
        readResource: fs.readFile.bind(fs),
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
  });
}
