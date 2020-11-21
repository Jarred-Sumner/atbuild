const { build } = require("esbuild");
const glob = require("glob");

module.exports = build({
  plugins: [require("./dist/esbuild")],
  entryPoints: ["./samples/use-bitfield.ts"],
  platform: "node",
  bundle: true,
  resolveExtensions: [".js", ".tsb", ".jsb", ".ts"],
  outdir: "./esbuild-plugin-samples",
});
