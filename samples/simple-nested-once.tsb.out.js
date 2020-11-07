var _this = {["___source___"]: ""};

;var $createHoursFormatter = (module.exports.$createHoursFormatter = (function $createHoursFormatter(prefix: string) {
        let originalThis = _this;

        if (!this || typeof this["___source___"] === 'undefined') {
          _this = {
            ["___source___"]: ""
          }
        } else {
          _this = this;
        }

        const buildEval = (function export___0_1__0_0() {
if (prefix === "hh") {
      _this.___source___ += "return function (date: Date) {\n          return (date.getUTCHours() % 12).padStart(2, \"0\")\n        }\n      ";
} else if (prefix === "h") {
      _this.___source___ += "return function (date: Date) {\n          return date.getUTCHours().padStart(2, \"0\")\n        }\n      ";
}
  
})();
    let output = _this.___source___;
    _this = originalThis;
  return typeof buildEval === 'undefined' ? output : buildEval;
}));

