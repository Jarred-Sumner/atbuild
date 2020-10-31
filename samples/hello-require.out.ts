var __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};
var require_stdin = __commonJS((exports, module) => {
  module.exports = "This was required.";
});
export default require_stdin();
