"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loader;
exports.raw = void 0;

var _atbuild = require("../atbuild");

const loaderUtils = require("loader-utils");

function loader(source) {
  const {
    header = true
  } = loaderUtils.getOptions(this);
  return _atbuild.AtBuild.eval(source.toString(), this.resourcePath, header);
}

const raw = true;
exports.raw = raw;