var _this = {["___source___"]: ""};

;var $multipleFields = (module.exports.$multipleFields = (function $multipleFields(fields) {
        let originalThis = _this;

        if (!this || typeof this["___source___"] === 'undefined') {
          _this = {
            ["___source___"]: ""
          }
        } else {
          _this = this;
        }

        const buildEval = (function export___0_1__0_0() {
_this.___source___ += "let result = 0;\n    ";
for (let i = fields.length - 1; i >= 0; i--) {
        const field = fields[i];
        _this.___source___ += "result <<= ";
_this.___source___ += (schema[field]);_this.___source___ += ";\n          result |= ";
_this.___source___ += (field);_this.___source___ += ";\n        ";
}
    _this.___source___ += "return result;\n    ";

})();
    let output = _this.___source___;
    _this = originalThis;
  return typeof buildEval === 'undefined' ? output : buildEval;
}));

