import { createFsFromVolume, Volume } from "memfs";
import path from "path";
import _webpack from "webpack";

export function webpack(fixture, options = { typescript: true }) {
  const compiler = _webpack({
    context: path.join(__dirname, "../"),
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: "bundle.js",
    },

    mode: "development",
    devtool: "source-map",
    target: "web",
    resolve: {
      extensions: [".@js", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.@js$/,
          type: "javascript/auto",
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  ["@babel/preset-typescript", { allExtensions: true }],
                  [
                    "@babel/preset-env",
                    {
                      targets: {
                        node: "current",
                      },
                    },
                  ],
                ],
              },
            },
            {
              loader: path.resolve(__dirname, "../src/webpack-loader"),
              options,
            },
          ],
        },
        {
          test: /\.js$/,
          type: "javascript/auto",
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-typescript",
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      node: "current",
                    },
                  },
                ],
              ],
            },
          },
        },
      ],
    },
    // plugins: [new AtBuildWebpackPlugin()],
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);

      resolve([stats, compiler.outputFileSystem]);
    });
  });
}
