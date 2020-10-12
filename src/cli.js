#!/usr/bin/env node
"use strict";

const meow = require("meow");
const { AtBuild } = require("atbuild");
const fs = require("fs");
const path = require("path");

const cli = meow(
  `
  AtBuild is a JavaScript preprocessor language. It lets you use JavaScript to write JavaScript.

  There are only two rules.
  (1): If the line starts with "@", it will be run at build-time and not included in the compiled source.
  (2): Any part of a line that contains @{} will be evaluated & replaced at build-time. Think of it like a template literal \${code} but swapped out at build-time, so @{require("fs").readFileSync("./file.txt")} will be replaced with the contents of "./file.txt".

	Usage
    $ atbuild [input.@js] [destination]
  Options
    --header: Include a header to let Flow, TypeScript, and ESLint know to ignore the file.
	Examples
    $ atbuild ./file.@js ./file.js
`,
  {
    flags: {
      header: {
        type: "boolean",
        default: true,
        isMultiple: false,
        isRequired: false,
      },
    },
  }
);
let input;
try {
  input = path.resolve(__dirname, cli.flags.input[0]);
} catch (exception) {
  if (cli.flags.input) {
    cli.showHelp(1);
  } else {
    console.error(exception);
    process.exit(1);
  }
}

let output = AtBuild.evalFile(target, cli.flags.header);

if (cli.flags.input[1]) {
  let target;
  try {
    target = path.resolve(__dirname, path.dirname(cli.flags.input[1]));
  } catch (exception) {
    console.error(
      `Output directory doesn't exist. Received ${path.join(
        __dirname,
        cli.flags.input[0]
      )}`
    );
    process.exit(1);
  }

  target += path.basename(cli.flags.input[1]);
  fs.writeFileSync(target, output);
  process.exit(0);
} else {
  console.log(output);
}
