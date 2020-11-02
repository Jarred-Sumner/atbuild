import { $ } from "atbuild";

// $$

const didRemoveBuildTimeCode = false;

// $$-

export const isRemoved = $(!didRemoveBuildTimeCode);
