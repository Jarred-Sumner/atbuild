
(module.exports.$createHoursFormatter = (function $createHoursFormatter(prefix: string ,) {
        const ___source___ = typeof this.___source___ === 'undefined' ? [] : this.___source___;

        const buildEval = (function export___0_1__0_0() {
  if (prefix === "hh") {
   ___source___.push("\n      return function (date: Date) {\n        return (date.getUTCHours() % 12).padStart(2, \"0\")\n      }\n    ");
___source___.push("} else if (prefix === \"h\") {\n   ");
___source___.push("\n      return function (date: Date) {\n        return date.getUTCHours().padStart(2, \"0\")\n      }\n    ");
___source___.push("}\n\n");
})();
  return typeof buildEval === 'undefined' ? ___source___.join("") : buildEval;
}));

