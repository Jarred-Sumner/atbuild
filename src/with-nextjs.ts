module.exports = (nextConfig = {}) => {
  if (!nextConfig.pageExtensions) {
    nextConfig.pageExtensions = ["@js", "jsb", "tsb", "@ts", "js", "jsx"];
  } else {
    nextConfig.pageExtensions.unshift("@js", "jsb", "tsb", "@ts");
  }

  return Object.assign({}, nextConfig, {
    webpack(_config, options) {
      let config = _config;
      if (nextConfig.webpack) {
        config = nextConfig.webpack(config, options);
      }

      const nextBabelLoaderContainer = config.module.rules.find((rule) => {
        return (
          (rule.use &&
            rule.use.loader &&
            rule.use.loader === "next-babel-loader") ||
          (rule.use &&
            rule.use.find((loader) => loader.loader === "next-babel-loader"))
        );
      });

      if (nextBabelLoaderContainer) {
        let loader;

        if (nextBabelLoaderContainer.use.loader === "next-babel-loader") {
          loader = nextBabelLoaderContainer.use;
        } else {
          loader = nextBabelLoaderContainer.use.find(
            (loader) => loader.loader === "next-babel-loader"
          );
        }

        config.resolve.extensions.unshift(".@js", ".jsb", ".tsb", ".@ts");

        const fs = require("fs");
        let tsconfig;
        if (fs.existsSync("./tsconfig.json")) {
          tsconfig = require(require("path").resolve("./tsconfig.json"));
        }

        config.module.rules.push({
          test: /\.(@js|jsb)$/,
          type: "javascript/auto",
          enforce: "pre",
          use: [
            loader,
            {
              loader: "atbuild/dist/webpack-loader",
              options: {
                typescript: false,
                ...(nextConfig.atbuild || {}),
              },
            },
          ],
        });

        config.module.rules.push({
          test: /\.(@ts|tsb)$/,
          type: "javascript/auto",
          enforce: "pre",
          use: [
            loader,
            {
              loader: "atbuild/dist/webpack-loader",
              options: {
                tsconfig,
                typescript: true,
                ...(nextConfig.atbuild || {}),
              },
            },
          ],
        });

        config.module.rules.push({
          test: /\.(jsx|js|ts|tsx)$/,
          type: "javascript/auto",
          enforce: "pre",
          exclude: /node_modules/,
          use: [
            {
              loader: "atbuild/dist/webpack-loader",
              options: {
                tsconfig,
                typescript: true,
                ...(nextConfig.atbuild || {}),
              },
            },
          ],
        });
      } else {
        throw "Atbuild failed to detect webpack-loader so it won't work. Please file an issue.";
      }

      return config;
    },
  });
};
