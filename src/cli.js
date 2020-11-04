#!/usr/bin/env node
"use strict";
const { performance } = require("perf_hooks");
const meow = require("meow");
const { AtBuild } = require("atbuild");
const fs = require("fs");
const path = require("path");

const { buildAST, transformAST } = require("./light");
let bundle;

const cli = meow(
  `
  AtBuild is a JavaScript preprocessor language. It lets you use JavaScript to write JavaScript, so you can easily move slow code from runtime to build-time.


  There are only two rules.

  (1): If the line starts with "@", it will be run at build-time and not included in the compiled source.
  (2): Any part of a line that contains @{} will be run at build-time. Think of it like a template literal \${code}
       but swapped out at build-time, so @{require("fs").readFileSync("./file.txt")} will be
       replaced with the contents of "./file.txt".

	Usage
    $ atbuild input.js [destination]
  Options
    --bundle    [true]:   Runs esbuild to resolve the modules for the backend code and then evals. This is what the webpack-loader does.
    --ast:                Print the ast & exit
    --print:              Print the generated code & exit
    --mode      [auto]    Determines flavor of Atbuild to use.
                          Can be: "light", "full", "auto"
                          - "auto": decide automatically based on the extension, default to "light"
                          - "light": regular JavaScript/TypeScript files
                          - "full": .@js or .jsb files (Atbuild)

    --types     [true]   Autogenerates a .ts.d file along with your code. This writes to disk. Requires bundle.
    --no-types           Improves performance by 2x-5x.
    --format    [esm]    "cjs" | "esm" | "iife". This option is passed to esbuild (https://esbuild.github.io/api/#format).
    --outdir             When bundling multiple files, output them in this directory instead
	Examples
    $ atbuild ./file.@js ./file.js
    $ atbuild ./file.js ./file.out.js
    $ atbuild ./file.@js
`,
  {
    flags: {
      verbose: {
        type: "boolean",
        default: !!(
          process.env.NODE_ENV === "development" || process.env.FORCE_DEV
        ),
        isMultiple: false,
        isRequired: false,
      },
      header: {
        type: "boolean",
        default: true,
        isMultiple: false,
        isRequired: false,
      },
      outdir: {
        type: "string",
        default: "",
        isMultiple: false,
        isRequired: false,
      },
      types: {
        type: "boolean",
        default: true,
        isMultiple: false,
        isRequired: false,
      },
      format: {
        type: "string",
        default: "esm",
        isMultiple: false,
        isRequired: false,
      },
      ast: {
        type: "boolean",
        default: false,
        isMultiple: false,
        isRequired: false,
      },
      print: {
        type: "boolean",
        default: false,
        isMultiple: false,
        isRequired: false,
      },
      bundle: {
        type: "boolean",
        default: true,
        isMultiple: false,
        isRequired: false,
      },
      mode: {
        type: "string",
        default: "auto",
        isMultiple: false,
        isRequired: true,
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

if (!input) {
  cli.showHelp(1);
}

async function run(input, destination, directory) {
  const source = await fs.promises.readFile(input, "utf8");
  let output;
  let _mode =
    { auto: "auto", light: "light", full: "full" }[cli.flags.mode] || "auto";

  let start;

  if (cli.flags.verbose) {
    start = performance.now();
  }

  if (cli.flags.bundle) {
    output = await bundle(source, {
      filename: input,
      destination: destination,
      directory: directory || destination,
      mode: cli.flags.mode,
      typescript: cli.flags.types,
      filepath: input,
      format: cli.flags.format,
      defaultMode: _mode,
    });
  }

  if (!cli.flags.bundle) {
    // if (cli.flags.types) {
    //   console.warn("Generating types not supported unless bundling");
    //   return;
    // }

    if (_mode === "auto") {
      const extension = path.extname(input);
      _mode =
        {
          ".js": "light",
          ".jsx": "light",
          ".ts": "light",
          ".tsx": "light",
          ".@js": "full",
          ".jsb": "full",
          ".@ts": "full",
          ".tsb": "full",
        }[extension] || "light";
    }

    if (cli.flags.ast && _mode === "light") {
      console.log([...buildAST(source)]);
    } else if (cli.flags.ast) {
      console.log([...AtBuild.buildAST(source)]);
    } else {
      cli.flags.print = true;
    }

    if (cli.flags.print && _mode === "light") {
      console.log(transformAST(buildAST(source)));
      process.exit(0);
    } else if (cli.flags.print) {
      console.log(AtBuild.transformAST(AtBuild.buildAST(source)));
      process.exit(0);
    }
  }

  if (destination) {
    await fs.promises.writeFile(destination, output || source, "utf8");
    console.log("Wrote", destination);
  } else {
    console.log(output);
  }

  if (cli.flags.verbose) {
    console.log(
      "Finished",
      input,
      "in",
      (performance.now() - start).toFixed(4)
    );
  }
}

if (cli.flags.bundle) {
  bundle = require("./bundle").bundle;
}

async function runBatch(inputs, outputDir) {
  for (let input of inputs) {
    try {
      await run(
        path.resolve(input),
        path.join(outputDir, path.basename(input))
      );
    } catch (exception) {
      console.error(exception);
    }
  }
}

if (cli.flags.outdir && cli.input.length === 1) {
  run(cli.input[0], path.join(cli.flags.outdir, path.basename(cli.input[0])));
} else if (cli.flags.outdir && cli.input.length > 1) {
  runBatch(cli.input, path.resolve(cli.flags.outdir));
} else if (cli.input.length === 1) {
  run(cli.input[0], null);
} else if (cli.input.length === 2) {
  run(cli.input[0], cli.input[1]);
}
