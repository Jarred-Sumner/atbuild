import { AtBuild } from "../atbuild";
import path from "path";
const loaderUtils = require("loader-utils");

export default function loader(source) {
  const { header = true } = loaderUtils.getOptions(this);
  const callback = this.async();

  let code;
  try {
    code = AtBuild.eval(source.toString(), this.resourcePath, header);
  } catch (exception) {
    callback(exception, null);
    return;
  }

  callback(null, code, source.toString());
}

export const raw = false;
