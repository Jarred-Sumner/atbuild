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

      function findBabelLoaderInRules(rule) {
        if (typeof rule === "object" && rule.loader === "next-babel-loader") {
          return rule.options;
        } else if (
          typeof rule.use === "object" &&
          rule.use.length &&
          rule.use[0]
        ) {
          for (let _rule of rule.use) {
            const __rule = findBabelLoaderInRules(_rule);
            if (__rule) {
              return __rule;
            }
          }
        } else if (
          typeof rule.use === "object" &&
          rule.use.loader === "next-babel-loader"
        ) {
          return rule.use.options;
        } else {
          return null;
        }
      }
      const loader = {
        loader: "next-babel-loader",
        options: findBabelLoaderInRules({ use: config.module.rules }),
      };

      config.resolve.extensions.unshift(".@js", ".jsb", ".tsb", ".@ts");

      const fs = require("fs");
      let tsconfig;
      if (fs.existsSync("./tsconfig.json")) {
        tsconfig = require(require("path").resolve("./tsconfig.json"));

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
          test: /\.(jsx|js|ts|tsx)$/,
          type: "javascript/auto",
          enforce: "pre",
          exclude: /(node_modules)|(vendor\/)|\.min\./,
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
        config.module.rules.push({
          test: /\.(jsx|js)$/,
          type: "javascript/auto",
          enforce: "pre",
          exclude: /(node_modules)|(vendor\/)|\.min\./,
          use: [
            {
              loader: "atbuild/dist/webpack-loader",
              options: {
                typescript: false,
                ...(nextConfig.atbuild || {}),
              },
            },
          ],
        });
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

      return config;
    },
  });
};
