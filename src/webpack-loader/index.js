import { AtBuild } from "../atbuild";
const loaderUtils = require("loader-utils");

export default function loader(source) {
  const { header = true } = loaderUtils.getOptions(this);

  return AtBuild.eval(source.toString(), this.resourcePath, header);
}

export const raw = true;
