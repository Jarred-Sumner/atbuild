import React from "react";
const foo = new Date("2020-11-07T23:30:04.443Z");
function TestPluginPage() {
  return /* @__PURE__ */ React.createElement("div", null, `!${foo}`);
}
export {
  TestPluginPage as default
};
