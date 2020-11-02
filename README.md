# AtBuild – JavaScript Preprocessor

AtBuild is an experimental JavaScript preprocessor. It lets you write JavaScript that writes JavaScript.

Use it for:

- Easy, editable code generation with TypeScript support
- Write high-performance JavaScript libraries by removing the runtime
- Determinstic dead code elimination
- Move slow code from runtime to buildtime

# How it works

There are two flavors of AtBuild.

1. AtBuild Light – compatible with current JavaScript syntax
2. AtBuild Full - more features but incompatible syntax, so you write some code in a `.jsb` file instead

### Atbuild Light

Atbuild

### Atbuild Full

Atbuild Full has two rules:

1. Any line that starts with `@` will be evaluated at buildtime instead of runtime.

2. Any line containing `@{codeInHere}` will be evaluated at buildtime instead of runtime.

You write some of your JavaScript in `.jsb` files, and by default, all the code in the file will be evaluated at runtime.

But, if the line starts with an `@` or if it contains `@{}`, those parts of the file will be switched out, and run at buildtime instead.

The code evaluated at buildtime is also JavaScript.

## Contrived example:

```js
// contrived-api-endpoint-codegenerator.jsb
@@

import {kebabCase} from 'lodash';
const BASE_URL = `http://example.com`;

@@


@for (let objectName of ["Post", "User", "Like", "PasswordResetToken"]) {
  export class @{objectName} {
    static async fromAPI(response) {
      const result = await (await response.body()).json();

      return new @{objectName}(result);
    }

    object = "@{kebabCase(objectName)}";
  }

  export function fetch${objectName}ById(id) {
    @var base = BASE_URL + `/${kebabCase(objectName)}s/`;

    return @{objectName}.fromAPI(fetch("@{base}" + id))
  }
@}
```

After we run it through `atbuild ./contrived-api-endpoint-codegenerator.jsb`, it becomes:

```js
// contrived-api-endpoint-codegenerator.js.

class Post {
  constructor() {
    this.object = "post";
  }
  static async fromAPI(response) {
    const result = await (await response.body()).json();
    return new Post(result);
  }
}
function fetchPostById(id) {
  return Post.fromAPI(fetch("http://example.com/posts/" + id));
}
class User {
  constructor() {
    this.object = "user";
  }
  static async fromAPI(response) {
    const result = await (await response.body()).json();
    return new User(result);
  }
}
function fetchUserById(id) {
  return User.fromAPI(fetch("http://example.com/users/" + id));
}
class Like {
  constructor() {
    this.object = "like";
  }
  static async fromAPI(response) {
    const result = await (await response.body()).json();
    return new Like(result);
  }
}
function fetchLikeById(id) {
  return Like.fromAPI(fetch("http://example.com/likes/" + id));
}
class PasswordResetToken {
  constructor() {
    this.object = "password-reset-token";
  }
  static async fromAPI(response) {
    const result = await (await response.body()).json();
    return new PasswordResetToken(result);
  }
}
function fetchPasswordResetTokenById(id) {
  return PasswordResetToken.fromAPI(
    fetch("http://example.com/password-reset-tokens/" + id)
  );
}
export {
  Like,
  PasswordResetToken,
  Post,
  User,
  fetchLikeById,
  fetchPasswordResetTokenById,
  fetchPostById,
  fetchUserById,
};
```

## Changelog

**October 30th, 2020**: Added support for nested buildtime modules to export functions that are only available at buildtime. This allows you to write zero-runtime libraries.

**October 30th, 2020**: Added support for nested buildtime modules in the webpack-loader, so you can import jsb files from inside jsb files and it will work as expected (buildtime code is executed, runtime code is generated)

**October 29th, 2020**: Added support for bundling buildtime code in the webpack loader, meaning you can use the same syntax for buildtime code and runtime code. This also makes it easy to import runtime modules at buildtime. The webpack-loader uses [esbuild](https://esbuild.github.io/) for bundling the backend code.

**October 28th, 2020**: Extremely WIP VSCode extension.

**October 28th, 2020**: `await` is now supported for buildtime code (not in webpack)

**October 28th, 2020**: New syntax: `@@` allows multiline buildtime code generation.

For example:

```java
// The code inside @@ is run at build-time.
@@
const fetch = require("node-fetch")
const resp = await fetch("https://github.com/Jarred-Sumner/atbuild/commit/master.patch")
const text = await resp.text()
@@


// At buildtime, `@{text}` is replaced with the output from https://github.com/Jarred-Sumner/atbuild/commit/master.patch.
module.exports = `@{text}`
```

**October 28th, 2020**: Added support for `require` in buildtime code. Runtime code works like normal and is run through Babel or any other loaders you use. ~Buildtime code isn't run through babel, but this might be implemented later via webpack's `this._compilation_.createChildCompiler`, which would run buildtime and runtime code both through webpack.~ Fixed

For example:

```java
// The code inside @@ is run at build-time.
@@
const fetch = require("node-fetch")
const resp = await fetch("https://github.com/Jarred-Sumner/atbuild/commit/master.patch")
const text = await resp.text()
@@


// At buildtime, `@{text}` is replaced with the output from https://github.com/Jarred-Sumner/atbuild/commit/master.patch.
module.exports = `@{text}`
```

**October 28th, 2020**: Added support for `require` in buildtime code. Runtime code works like normal and is run through Babel or any other loaders you use. ~Buildtime code isn't run through babel, but this might be implemented later via webpack's `this._compilation_.createChildCompiler`, which would run buildtime and runtime code both through webpack.~ Fixed

## Why?

<img alt="Y U Do Dis meme" src="./explain/y.png" height=120 />

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

# Installation

With yarn:

```bash
yarn add atbuild
```

npm:

```bash
npm install atbuild
```

## CLI

`atbuild` has a small CLI you can use.

```bash
atbuild ./input.jsb
```

```bash
atbuild ./input.jsb ./output.js
```

```bash
atbuild ./input.jsb ./output.js --pretty --no-header
```

## Webpack Loader

**The recommended way to use AtBuild is through the Webpack loader**. This configures Webpack to run any file that ends in `.jsb` through AtBuild automatically.

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
        // File extension is .jsb
        test: /\.jsb$/,
        exclude: /node_modules/,
        type: "javascript/auto",
        use: [
          {
            loader: "atbuild/webpack-loader
          },
          // Run Babel on runtime code afterwards (optional)
          {
            loader: "babel-loader",
            options: {/* your babel options in here if relevant */},
          },
        ]
      },
    ],
  }
  // ...
}
```

### Next.js integration

This will be cleaned up & moved into a plugin eventually (such as `next-with-atbuild`), however this is how I currently use AtBuild with Next.js:

```js
// Figure out where next-babel-loader is hiding
const nextBabelLoaderContainer = config.module.rules.find((rule) => {
  return (
    (rule.use && rule.use.loader && rule.use.loader === "next-babel-loader") ||
    (rule.use &&
      rule.use.find((loader) => loader.loader === "next-babel-loader"))
  );
});

if (nextBabelLoaderContainer) {
  let loader;

  if (nextBabelLoaderContainer.use.loader === "next-babel-loader") {
    loader = nextBabelLoaderContainer.use;
  } else {
    loader = nextBabelLoaderContainer.use.find(
      (loader) => loader.loader === "next-babel-loader"
    );
  }

  config.module.rules.unshift({
    test: /\.jsb$/,
    use: [
      // Pass the loader in before atbuild, so that atbuild runs first.g
      loader,
      {
        // This is where the webpack loader is added.
        loader: "atbuild/webpack-loader",
      },
    ],
  });
} else {
  // Feel free to open an issue if you see this warning.
  console.warn("Unable to activate AtBuild");
}
```

## Alternatives

- [`babel-plugin-codegen`](https://github.com/kentcdodds/babel-plugin-codegen) makes it easy to run build scripts, but it gets tough if you want to do some things at buildtime and some other things at run-time for the same code.
