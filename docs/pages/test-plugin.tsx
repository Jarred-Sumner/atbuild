import React from "react";
import { $lastBuiltAt } from "../lib/lastBuiltAt.tsb"; // $

const foo = $lastBuiltAt();

export default function TestPluginPage() {
  return <div>{`!${foo}`}</div>;
}
