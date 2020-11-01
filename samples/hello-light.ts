// $$

const buildTimeOnly = true;

const fs = require("fs");
const path = require("path");

function $GetPackageJson() {
  return fs.readFileSync(path.join(__dirname, "../", "package.json"), "utf8");
}

// $$

const PACKAGE_JSON_CONTENTS = $GetPackageJson();

const didRemoveBuildTimeCode = $(typeof buildTimeOnly !== "undefined");
