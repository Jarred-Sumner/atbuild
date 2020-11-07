var _this = {["___source___"]: ""};

;var $log = (module.exports.$log = (function $log(value: string) {
        let originalThis = _this;

        if (!this || typeof this["___source___"] === 'undefined') {
          _this = {
            ["___source___"]: ""
          }
        } else {
          _this = this;
        }

        const buildEval = (function export___0_1__0_0() {
_this.___source___ += "function(value) {\n      console.log(value)\n    }\n  ";

})();
    let output = _this.___source___;
    _this = originalThis;
  return typeof buildEval === 'undefined' ? output : buildEval;
}));

