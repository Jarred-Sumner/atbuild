
(module.exports.$createHoursFormatter = (function $createHoursFormatter(prefix: string ,___source___ = [], ___replacers___ = []) {
  const buildEval = (function export___0_1__0_0(___source___) {
  if (prefix === "hh") {
   ___source___.push("\n      return function (date: Date) {\n        return (date.getUTCHours() % 12).padStart(2, \"0\")\n      }\n    ");
})(___source___);
  return typeof buildEval === 'undefined' ? ___source___.join("") : buildEval;
}));

} else if (prefix === "h") {
   ___source___.push("\n      return function (date: Date) {\n        return date.getUTCHours().padStart(2, \"0\")\n      }\n    ");
}

