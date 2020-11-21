# AtBuild – Experimental JavaScript Preprocessor

AtBuild is a programmable code generation tool for JavaScript. It lets you write JavaScript that writes JavaScript.

Use it for:

- Easy, editable code generation with full TypeScript support
- Write high-performance JavaScript libraries by removing the runtime
- Determinstic dead code elimination
- Move slow code from runtime to buildtime

Contributions & feedback are very welcome – feel free to file an issue.

<a target="_blank" href="https://atbuild.vercel.app/bundle/date-formatter.tsb">
  <strong>Try the playground</strong>

  <img src="https://atbuild.vercel.app/screenshot.png" width="100%" />
</a>

# Installation

With yarn:

```bash
yarn add atbuild
```

npm:

```bash
npm install atbuild
```

## Next.js integration

To use with Next.js, add the following to your `next.config.js`;

```js
module.exports = require("atbuild/with-nextjs");
```

If you have an existing Next.js config, then use it like this:

```js
const withAtBuild = require("atbuild/with-nextjs");

module.exports = withAtBuild({
  webpack(config, options) {
    // your webpack config here:
  },
});
```

## esbuild integration

If you're using esbuild, you can use AtBuild's esbuild plugin like this:

```js
const { build } = require("esbuild");

module.exports = build({
  // Add `require("atbuild/esbuild")` to the list of esbuild plugins
  plugins: [require("atbuild/esbuild")],
  // Add .tsb and .jsb to the list of extensions to resolve
  resolveExtensions: [".tsb", ".jsb", ".ts", ".js"],
});
```

For esbuild, the entrypoint can't be a `.tsb`/`.jsb` file due to https://github.com/evanw/esbuild/issues/546.

## Webpack Loader

Buildtime code is run through a [high performance bundler](https://esbuild.github.io/) for you automatically, so you can write your buildtime code using the same modern JavaScript as the rest of your code. This also means you can import other modules, and those modules don't have to be `.jsb` files - they can be any other file in your codebase (so long as it runs in Node after bundling).

Runtime code is passed through webpack as regular JavaScript – so you can still use babel-loader as normal.

```
// Webpack config
module.exports = {
  // ...
  module: {
    // ...
    rules: [
      // ...

      // AtBuild.js Webpack Loader
      {
        test: /\.(jsb|js|ts|tsx|jsx|tsb|@js)$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: [
          {
            loader: "atbuild/webpack-loader,
            options: {
              // Generate a .d.ts file automatically so your IDE can more easily interop with AtBuild files.
              typescript: true,
            }
          },
        ]
      },
    ],
  }
  // ...
}
```

## CLI

`atbuild` has a small CLI you can use.

```bash
atbuild ./input.jsb --print
```

```bash
atbuild ./input.jsb ./output.js --no-bundle
```

```bash
atbuild ./input.js ./output.js --ast
```

```bash
atbuild ./*.js --outdir=./out
```

```bash
atbuild ./*.ts --types
```

# How it works

There are two flavors of AtBuild.

1. AtBuild Light: compatible with current JavaScript syntax
2. AtBuild Full: a powerful JavaScript-based templating language for generating code. It's close to but not quite JavaScript, which is why it has it's own file extension: `.jsb`/`.tsb`

### Atbuild Light

Atbuild Light preprocesses your JavaScript & TypeScript files by setting three conventions:

1. Code inside of `$(buildTimeCodeInHere)` will be run & replaced at buildtime
2. Code fenced within `// $$` will be moved to buildtime
3. Lines ending with `// $` with be moved to buildtime

#### Small exmaple

`input.js`:

```js
import { $ } from "atbuild";

// $$

const didRemoveBuildTimeCode = false;

// $$-

export const isRemoved = $(!didRemoveBuildTimeCode);
```

⌨️ `atbuild ./input.js ./output.js`

`output.js`:

```js
const isRemoved = true;
export { isRemoved };
```

Note: the `import {$}` is there for convience so your editor doesn't get mad. Any function call starting with `$` is assumed to be a build-time function.

Unlike other buildtime code generation tools, you can `import` from `node_modules`, and even import other modules in your codebase (so long as it runs without a `window` object). The input is transformed using `esbuild`.

`input.js`:

```ts
import { $createDateFormatter } from "atbuild/demo/date-formatter"; // $

export const formatTime = $createDateFormatter("hh:mm:ss");
```

[⌨️ `atbuild ./input.js ./output.js`](https://atbuild.vercel.app/bundle/date-formatter.tsb)

`output.js`:

```js
export const formatTime = function (date: Date) {
  let formattedDate = "";
  var hours = date.getUTCHours() % 12;
  hours = hours || 12;
  formattedDate += hours.toString(10).padStart(2, "0");
  formattedDate += ":";
  formattedDate += date.getUTCMinutes().toString(10).padStart(2, "0");
  formattedDate += ":";
  formattedDate += date.getUTCSeconds().toString(10).padStart(2, "0");
  return formattedDate;
};
```

And it supports types.

For compatibility reasons, exporting build time code from JavaScript/TypeScript outside of the file is not supported. But, that's why there's Atbuild Full, which lets you write libraries for proceedurally generating code at build time.

### AtBuild Full

Atbuild Full adds a few new keywords to JavaScript. It lets you evaluate & generate code at build time using JavaScript.

[More documentation](./docs-md/full.mdx)

1. `@build`: code contained inside `@build` will be run at build-time instead of runtime

```js
@build
  const yourBrowserDoesntKnowAboutThisCode = true;
@end
```

2. `@run`: code contained inside `@run` will be included at runtime.

```js
@run
  console.log("This code will be included at runtime");
@end
```

3. `@run` and `@build` can be nested. `@()` is like string interpolation but for generating code.

```js
@build
  // This for loop isn't included in the runtime code.
  for (let i = 0; i < 3;i++) {
    @run
      console.log("This code will be included at runtime @(i)");
    @end
  }
@end
```

And this is the output:

```js
console.log("This code will be included at runtime 0");
console.log("This code will be included at runtime 1");
console.log("This code will be included at runtime 2");
```

4. `@export function $FunctionNameGoesHere(arguments, in, here)` adds a build-time exported function that can be called from regular JavaScript/TypeScript files. Before it reaches the browser, the function call is replaced with the code generated from the function call.

You write some of your JavaScript in `.jsb` files, and by default, all the code in the file will be evaluated at runtime.

The code evaluated at buildtime is also JavaScript.

All of this works with your bundler, so you can import React components and generates type definitions.

## Contrived example:

```js
// contrived-api-endpoint-codegenerator.jsb.
@build

import { kebabCase, startCase, toLower} from 'lodash';
const titleize = str => startCase(toLower(str));
const BASE_URL = `http://example.com`;

@end

type BaseType = {
  id: number;
}

@build
  for (let objectName of ["Post", "User", "Like", "PasswordResetToken"]) {
    @run
      export type @(objectName) = BaseType & {
        object: "@(kebabCase(objectName))";

        @build
        switch(objectName) {
          case "PasswordResetToken": {
            @run
              used: boolean;
              expiry: Date;
            @end
          }
        }
        @end
      }

      export function build@(objectName)FromJSON(json: Object): @(objectName) {
        return json;
      }

      export async function fetch@(objectName)ById(id: number): Promise<@(objectName)> {
        @build
          var base = BASE_URL + `/${kebabCase(objectName)}s/`;
        @end

        const body = (await fetch("@(base)" + id)).body()
        const json = await body.json()
        return build@(objectName)FromJSON(json);
      }
    @end
  }
@end
```

After we run it through `atbuild ./contrived-api-endpoint-codegenerator.jsb`, it becomes:

```js
// contrived-api-endpoint-codegenerator.js
function buildPostFromJSON(json) {
  return json;
}
async function fetchPostById(id) {
  const body = (await fetch("http://example.com/posts/" + id)).body();
  const json = await body.json();
  return buildPostFromJSON(json);
}
function buildUserFromJSON(json) {
  return json;
}
async function fetchUserById(id) {
  const body = (await fetch("http://example.com/users/" + id)).body();
  const json = await body.json();
  return buildUserFromJSON(json);
}
function buildLikeFromJSON(json) {
  return json;
}
async function fetchLikeById(id) {
  const body = (await fetch("http://example.com/likes/" + id)).body();
  const json = await body.json();
  return buildLikeFromJSON(json);
}
function buildPasswordResetTokenFromJSON(json) {
  return json;
}
async function fetchPasswordResetTokenById(id) {
  const body = (
    await fetch("http://example.com/password-reset-tokens/" + id)
  ).body();
  const json = await body.json();
  return buildPasswordResetTokenFromJSON(json);
}
export {
  buildLikeFromJSON,
  buildPasswordResetTokenFromJSON,
  buildPostFromJSON,
  buildUserFromJSON,
  fetchLikeById,
  fetchPasswordResetTokenById,
  fetchPostById,
  fetchUserById,
};
```

This also generates a `contrived-api-endpoint-codegenerator.ts.d` file:

```ts
declare type BaseType = {
  id: number;
};
export declare type Post = BaseType & {
  object: "post";
};
export declare function buildPostFromJSON(json: Object): Post;
export declare function fetchPostById(id: number): Promise<Post>;
export declare type User = BaseType & {
  object: "user";
};
export declare function buildUserFromJSON(json: Object): User;
export declare function fetchUserById(id: number): Promise<User>;
export declare type Like = BaseType & {
  object: "like";
};
export declare function buildLikeFromJSON(json: Object): Like;
export declare function fetchLikeById(id: number): Promise<Like>;
export declare type PasswordResetToken = BaseType & {
  object: "password-reset-token";
  used: boolean;
  expiry: Date;
};
export declare function buildPasswordResetTokenFromJSON(
  json: Object
): PasswordResetToken;
export declare function fetchPasswordResetTokenById(
  id: number
): Promise<PasswordResetToken>;
export {};
```

## Changelog

**November 9th**: Bump to latest esbuild with plugin API.

**November 6th**: New syntax for Atbuild Full, and a new parser to go with it.

**October 30th, 2020**: Added support for nested buildtime modules to export functions that are only available at buildtime. This allows you to write zero-runtime libraries.

**October 30th, 2020**: Added support for nested buildtime modules in the webpack-loader, so you can import jsb files from inside jsb files and it will work as expected (buildtime code is executed, runtime code is generated)

**October 29th, 2020**: Added support for bundling buildtime code in the webpack loader, meaning you can use the same syntax for buildtime code and runtime code. This also makes it easy to import runtime modules at buildtime. The webpack-loader uses [esbuild](https://esbuild.github.io/) for bundling the backend code.

**October 28th, 2020**: Extremely WIP VSCode extension.

**October 28th, 2020**: Added support for `require` in buildtime code. Runtime code works like normal and is run through Babel or any other loaders you use. ~Buildtime code isn't run through babel, but this might be implemented later via webpack's `this._compilation_.createChildCompiler`, which would run buildtime and runtime code both through webpack.~ Fixed

## Why?

<img alt="Y U Do Dis meme" src="./explain/y.png" height="120" />

Extremely fast native languages like Rust & C often use [inline expansion](https://en.wikipedia.org/wiki/Inline_expansion) and [loop unrolling](https://en.wikipedia.org/wiki/Loop_unrolling) to move work from runtime to buildtime. For code that doesn't change much, this can be a massive performance improvement.

Unfortunately, since JavaScript is a dynamic language, that's not natively supported. High performance JavaScript libraries like [ndarray](https://github.com/scijs/ndarray) and [Kiwi](https://github.com/evanw/kiwi) resort to [writing code inside code](https://github.com/scijs/ndarray/blob/master/ndarray.js#L123) by [adding strings together](https://github.com/evanw/kiwi/blob/1a82ea6592ff25f26e35ca69e58c98852072eae9/js/js.ts#L11), which is hard for humans to read whats going on.

Nowadays, much of the JavaScript we write is already behind [seven](https://webpack.js.org/) [different](https://babeljs.io/) [compilers](https://v8.dev/docs/turbofan), so why not add another?

### What can I use this for?

I wrote AtBuild because I needed to improve the performance for some parts of a game I'm building.

But, here are some other ways you could use this:

- Zero-runtime SQL ORM. Instead of a general-purpose SQL query builder evaluated at runtime (what Sequelize and every other JavaScript SQL ORM does), a SQL ORM built with AtBuild could compile down to a handful of functions that format the specific SQL strings used in the application, while being just as easy to use as Sequelize. You'd get the performance of hand-rolling your SQL, with the developer experience of a SQL ORM.
- Edit autogenerated code for calling API endpoints. If you use something like [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) and you want to edit the generated code, you often end up writing wrappers for the generated code. Wouldn't it be better if you could just edit the generated code instead?
- Preprocessing data ahead of time, so that it only is sent once instead of re-evaluated at runtime
- Server-side rendering. Theoretically, you could use this for server-side rendering. AtBuild is a lot like [EJS](https://ejs.co/) but with different syntax.

How is this different than [Prepack](https://prepack.io/)?

Like AtBuild, Prepack inlines & prevaluates code. But, AtBuild lets you choose what code runs at runtime and what code runs at buildtime, and use that to generate code. Loops that conditionally add or remove runtime code are not possible with Prepack or with [`babel-plugin-codegen`](https://github.com/kentcdodds/babel-plugin-codegen).

### Tests

If you want to use AtBuild Full with Jest, add the Jest transform at `"<rootDir>/node_modules/atbuild/jest.js"`.

For example:

```js
module.exports = {
  transform: {
    "^.+\\.(@ts|@js|jsb|tsb)$": "<rootDir>/node_modules/atbuild/jest.js",
  },
};
```

If you're using `babel-jest`, add the Jest transform from `"<rootDir>/node_modules/atbuild/jest-with-babel.js"` instead.

```js
module.exports = {
  transform: {
    "^.+\\.(@ts|@js|jsb|tsb)$":
      "<rootDir>/node_modules/atbuild/jest-with-babel.js",
  },
};
```

This skips bundling and assumes Jest will know to deal with it.

### JavaScript API

To invoke AtBuild Full programatically:

```js
const { AtBuild } = require("atbuild");

const contents = AtBuild.transformAST(
  // filepath is optional, but is helpful for error messages.
  AtBuild.buildAST(source, filepath),
  source
);
```

To invoke AtBuild Light programatically:

```js
const { transformAST, buildAST } = require("atbuild/light");

const contents = transformAST(
  // filepath is optional, but is helpful for error messages.
  buildAST(source, filepath),
  source
);
```

This won't run the bundler or write to disk.

To do that, you'll want to look at <a href="./src/bundle.ts">./src/bundle.ts</a>.

### Syntax highlighting

There's a half implemented syntax highlighter in `atbuild-vscode`. Contributions are very welcome.

### Ignore file

if you want to make sure AtBuild Light does not run on a specific file, stick this at the top of the file.

```js
// atbuild-ignore-file
```

This is helpful if you're bundling already minified files that use `$` as a function call.

The Next.js integration automatically excludes `node_modules` and file paths with `vendor` or `.min.` in the filename.

## Alternatives

- [`babel-plugin-codegen`](https://github.com/kentcdodds/babel-plugin-codegen) makes it easy to run build scripts, but it gets tough if you want to do some things at buildtime and some other things at run-time for the same code.
