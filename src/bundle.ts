import fs from "fs";
import path from "path";

const { runWithOptions } = require("./webpack-loader");

export type BundleInput = {
  format: "iife" | "cjs" | "esm";
  mode: "full" | "light" | "auto";
  filepath: string;
  defaultMode: "auto" | "light" | "full";
  typescript: boolean;
  destination: string;
  directory: string;
  readFile: (input: string) => string;
  writeFile: (path: string, content: string) => Promise<void>;
};

async function writeFile(name, content, destination, filepath) {
  if (destination) {
    try {
      await fs.promises.writeFile(
        name.replace(path.basename(filepath), path.basename(destination)),
        content,
        "utf8"
      );
      console.log("Wrote", name);
    } catch (exception) {
      console.error("Error writing file", name);
      console.log(`// ${name}`);
      console.log(content);
    }
  } else {
    console.log(`// ${name}`);
    console.log(content);
  }
}

export function bundle(
  source: string,
  {
    format,
    mode,
    filepath,
    defaultMode = "auto",
    typescript,
    destination,
    readFile = fs.readFileSync,
    writeFile: _writeFile,
  }: BundleInput
): Promise<string> {
  return new Promise((resolve, reject) => {
    let activateCallbackFunction = () => {
      return (err, code) => {
        if (err) {
          reject(err);
        } else {
          resolve(code);
        }
      };
    };

    const result = runWithOptions(
      source,
      {
        mode,
        typescript,
      },
      filepath,
      readFile,
      activateCallbackFunction,
      () => {},
      format,
      _writeFile ||
        ((name, content) => writeFile(name, content, destination, filepath)),

      defaultMode
    );

    if (result === null) {
      return resolve(source);
    } else if (typeof result === "undefined") {
    } else if (typeof result === "string") {
      return resolve(result);
    }
  });
}
