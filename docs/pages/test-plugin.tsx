import LAST_BUILD from "../lib/getLastBuild"; // $

export default function TestPluginPage() {
  return <div>{LAST_BUILD.toISOString()}</div>;
}
