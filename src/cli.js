#!/usr/bin/env node
"use strict";

const meow = require("meow");
const { AtBuild } = require("atbuild");
const fs = require("fs");
const path = require("path");

const cli = meow(
  `
  AtBuild is a JavaScript preprocessor language. It lets you use JavaScript to write JavaScript, so you can easily move slow code from runtime to build-time.

  There are only two rules.

  (1): If the line starts with "@", it will be run at build-time and not included in the compiled source.
  (2): Any part of a line that contains @{} will be run at build-time. Think of it like a template literal \${code}
       but swapped out at build-time, so @{require("fs").readFileSync("./file.txt")} will be
       replaced with the contents of "./file.txt".

	Usage
    $ atbuild input.@js [destination]
  Options
    --header [true]:     Include a header to let Flow, TypeScript, and ESLint know to ignore the file.
    --no-header [false]: Skip the header
    --pretty [false]:    Run Prettier on the output. Requires "prettier" to be installed globally.
	Examples
    $ atbuild ./file.@js ./file.js
    $ atbuild ./file.@js
    $ atbuild ./file.@js | node # Runs the file
`,
  {
    flags: {
      header: {
        type: "boolean",
        default: true,
        isMultiple: false,
        isRequired: false,
      },
      pretty: {
        type: "boolean",
        default: false,
      },
    },
  }
);
let input;
try {
  input = cli.input[0];
} catch (exception) {
  if (!cli.input[0]) {
    cli.showHelp(1);
  } else {
    console.error(exception);
    process.exit(1);
  }
}

let output = AtBuild.evalFile(input, cli.flags.header);

if (cli.flags.pretty) {
  try {
    const prettier = require("prettier");
    output = prettier.format(output, { parser: "babel-flow", filepath: input });
  } catch (exception) {
    console.error("--pretty failed: Prettier isn't installed?");
    process.exit(1);
  }
}

if (cli.input[1]) {
  fs.writeFileSync(cli.input[1], output);
  process.exit(0);
} else {
  console.log(output);
}
