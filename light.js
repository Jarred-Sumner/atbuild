if (typeof window === "undefined") {
  module.exports = require("./dist/light");
} else {
  module.exports = require("./web/light");
}
