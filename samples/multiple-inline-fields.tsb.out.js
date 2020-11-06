
(module.exports.$multipleFields = (function $multipleFields(fields ,___source___ = [], ___replacers___ = []) {
  const buildEval = (function export___0_1__0_0(___source___) {
 ___source___.push("\n    let result = 0;\n  ");
})(___source___);
  return typeof buildEval === 'undefined' ? ___source___.join("") : buildEval;
}));

(function build__1(___source___) {
    for (let i = fields.length - 1; i >= 0; i--) {
      const field = fields[i];
     ___source___.push("\n        result <<= ");
___source___.push((function build___9_20__9_34(___source___)  { return (schema[field]);})(___source___, []));___source___.push(";\n        result |= ");
___source___.push((function build___10_19__10_25(___source___)  { return (field);})(___source___, []));___source___.push(";\n      ");
}  )(___source___, [])}
  ___source___.push("\n    return result;\n  ");
