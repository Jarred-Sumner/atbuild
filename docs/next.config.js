const withTranspileModules = require("next-transpile-modules")([
  "atbuild",
  "monaco-editor",
]);
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const withCSS = require("@zeit/next-css");
const withWorker = require("@zeit/next-workers");

const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      require("remark-prism"),
      require("remark-slug"),
      require("remark-autolink-headings"),
    ],
    rehypePlugins: [],
  },
});

module.exports = withCSS(
  withMDX(
    withTranspileModules({
      pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
      webpack: (config) => {
        const rule = config.module.rules
          .find((rule) => rule.oneOf)
          .oneOf.find(
            (r) =>
              // Find the global CSS loader
              r.issuer && r.issuer.include && r.issuer.include.includes("_app")
          );
        if (rule) {
          rule.issuer.include = [
            rule.issuer.include,
            // Allow `monaco-editor` to import global CSS:
            /[\\/]node_modules[\\/]monaco-editor[\\/]/,
          ];
        }

        config.plugins.push(
          new MonacoWebpackPlugin({
            languages: ["json", "typescript", "javascript"],
            filename: "static/[name].worker.js",
            // customLanguages,
          })
        );

        config.module.rules.push({
          test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
          use: {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "[name].[ext]",
            },
          },
        });

        return config;
      },
    })
  )
);
