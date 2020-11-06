
(module.exports.$sizeof = (function $sizeof(value: number ,___source___ = [], ___replacers___ = []) {
  const buildEval = (function export___0_1__4_1(___source___) {
 (function build__1(___source___) {
    return (Math.log2n(value) + 1) | 0;
  }  )(___source___, [])})(___source___);
  return typeof buildEval === 'undefined' ? ___source___.join("") : buildEval;
}));


(module.exports.$BitField = (function $BitField(object, _BitFieldClassName ,___source___ = [], ___replacers___ = []) {
  const buildEval = (function export___6_1__83_17(___source___) {
 (function build__2(___source___) {
    const BitFieldClassName = _BitFieldClassName || "BitFieldClassName"
    const BitFieldMixin = require("structurae").BitFieldMixin;
    const { fields, masks, schema, offsets } = BitFieldMixin(object);

   ___source___.push("\n      function() {\n        return class ");
___source___.push((function build___14_22__14_42(___source___)  { return (BitFieldClassName);})(___source___, []));___source___.push("{\n          static masks = ");
___source___.push((function build___15_26__15_32(___source___)  { return (masks);})(___source___, []));___source___.push(";\n          static offsets = ");
___source___.push((function build___16_28__16_36(___source___)  { return (offsets);})(___source___, []));___source___.push(";\n          static schema = ");
___source___.push((function build___17_27__17_34(___source___)  { return (schema);})(___source___, []));___source___.push(";\n          static fields = ");
___source___.push((function build___18_27__18_34(___source___)  { return (fields);})(___source___, []));___source___.push(";\n\n         ");
___source___.push((function build__4(___source___) {
            for (let field of fields) {
             ___source___.push("\n                ");
___source___.push((function build___23_17__23_23(___source___)  { return (field);})(___source___, []));___source___.push(": number;\n              ");
}  )(___source___, []));___source___.push("}\n          ");
static encode(
           (function build__3(___source___) {
              for (let i = 0; i < fields.length; i++) {
               ___source___.push("\n                  ");
___source___.push((function build___32_19__32_29(___source___)  { return (fields[i]);})(___source___, []));___source___.push(": number,\n                }\n              }\n            ");
}  )(___source___, [])) {
            let result = 0;

           (function build__3(___source___) {
              for (let i = fields.length - 1; i >= 0; i--) {
                const field = fields[i];
               ___source___.push("\n                  result <<= ");
___source___.push((function build___43_30__43_44(___source___)  { return (schema[field]);})(___source___, []));___source___.push(";\n                  result |= ");
___source___.push((function build___44_29__44_35(___source___)  { return (field);})(___source___, []));___source___.push(";\n                ");
}  )(___source___, [])}
            }  )(___source___, [])return result;
          }

         (function build__2(___source___) {
            for (let index of [0,1]) {
             ___source___.push("\n               ");
___source___.push((function build__4(___source___) {
                  if (index === 0) {
                   ___source___.push("\n                      static decodeRef(value: number, result: ");
___source___.push((function build___58_63__58_81(___source___)  { return (BitFieldClassName);})(___source___, []));___source___.push(") {\n                    ");
}  )(___source___, []));___source___.push("} else {\n                   ");
___source___.push("\n                      static cached = new Array(");
___source___.push((function build___62_49__62_63(___source___)  { return (fields.length);})(___source___, []));___source___.push(")\n                      static decode(value: number) {\n                        const result = this.cached;\n                    ");
}
                }  )(___source___, [])let value = data;
               (function build__2(___source___) {
                  for (let i = 0; i < fields.length; i++) {
                    const field = fields[i];
                    const size = schema[field];
                   ___source___.push("\n                      result.");
___source___.push((function build___75_30__75_36(___source___)  { return (field);})(___source___, []));___source___.push("= value & ");
___source___.push((function build___75_48__75_61(___source___)  { return (masks[field]);})(___source___, []));___source___.push(";\n                      value >>= ");
___source___.push((function build___76_33__76_38(___source___)  { return (size);})(___source___, []));___source___.push(";\n                    ");
}  )(___source___, [])}

                 ___source___.push("\n                    return result;\n                  ");
})(___source___);
  return typeof buildEval === 'undefined' ? ___source___.join("") : buildEval;
}));

}
        }()
    