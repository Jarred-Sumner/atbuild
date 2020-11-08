const docs = JSON.parse(
  require("fs").readFileSync("./docs/package.json", "utf-8")
);
const pkg = require("../package.json");

docs.dependencies.atbuild = pkg.version;

require("fs").writeFileSync(
  "./docs/package.json",
  JSON.stringify(docs, null, 2)
);
