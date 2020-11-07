var _this = {["___source___"]: ""};

;var $sizeof = (module.exports.$sizeof = (function $sizeof(value: number) {
        let originalThis = _this;

        if (!this || typeof this["___source___"] === 'undefined') {
          _this = {
            ["___source___"]: ""
          }
        } else {
          _this = this;
        }

        const buildEval = (function export___0_1__0_0() {
return (Math.log2n(value) + 1) | 0;
  
})();
    let output = _this.___source___;
    _this = originalThis;
  return typeof buildEval === 'undefined' ? output : buildEval;
}));


;var $BitField = (module.exports.$BitField = (function $BitField(object,  _BitFieldClassName) {
        let originalThis = _this;

        if (!this || typeof this["___source___"] === 'undefined') {
          _this = {
            ["___source___"]: ""
          }
        } else {
          _this = this;
        }

        const buildEval = (function export___7_1__0_0() {
const BitFieldClassName = _BitFieldClassName || "BitFieldClassName"
    const BitFieldMixin = require("structurae").BitFieldMixin;
    const { fields, masks, schema, offsets } = BitFieldMixin(object);

    _this.___source___ += "function() {\n        return class ";
_this.___source___ += (BitFieldClassName);_this.___source___ += "{\n          static masks = ";
_this.___source___ += (masks);_this.___source___ += ";\n          static offsets = ";
_this.___source___ += (offsets);_this.___source___ += ";\n          static schema = ";
_this.___source___ += (schema);_this.___source___ += ";\n          static fields = ";
_this.___source___ += (fields);_this.___source___ += ";\n\n          ";
for (let field of fields) {
              _this.___source___ += (field);_this.___source___ += ": number;\n              ";
}
          _this.___source___ += "static encode(\n            ";
for (let i = 0; i < fields.length; i++) {
                _this.___source___ += (fields[i]);_this.___source___ += ": number,\n                ";
}
            _this.___source___ += ") {\n            let result = 0;\n\n            ";
for (let i = fields.length - 1; i >= 0; i--) {
                const field = fields[i];
                _this.___source___ += "result <<= ";
_this.___source___ += (schema[field]);_this.___source___ += ";\n                  result |= ";
_this.___source___ += (field);_this.___source___ += ";\n                ";
}
            _this.___source___ += "return result;\n          }\n\n          ";
for (let index of [0,1]) {
              if (index === 0) {
                    _this.___source___ += "static decodeRef(value: number, result: ";
_this.___source___ += (BitFieldClassName);_this.___source___ += ") {\n                    ";
} else {
                    _this.___source___ += "static cached = new Array(";
_this.___source___ += (fields.length);_this.___source___ += ")\n                      static decode(value: number) {\n                        const result = this.cached;\n                    ";
}
                _this.___source___ += "let value = data;\n                ";
for (let i = 0; i < fields.length; i++) {
                    const field = fields[i];
                    const size = schema[field];
                    _this.___source___ += "result.";
_this.___source___ += (field);_this.___source___ += " = value & ";
_this.___source___ += (masks[field]);_this.___source___ += ";\n                      value >>= ";
_this.___source___ += (size);_this.___source___ += ";\n                    ";
}

                  _this.___source___ += "return result;\n                  ";
}
        _this.___source___ += "}()\n    ";

})();
    let output = _this.___source___;
    _this = originalThis;
  return typeof buildEval === 'undefined' ? output : buildEval;
}));

