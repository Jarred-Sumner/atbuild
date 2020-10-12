# AtBuild – JavaScript Preprocessor

AtBuild is a JavaScript preprocessor language. It lets you use JavaScript to write JavaScript, to help you move slow code from runtime to buildtime.

# How it works

AtBuild has two rules:

1. Any line that starts with `@` will be evaluated at buildtime instead of runtime.

2. Any line containing @{codeInHere} will be evaluated at buildtime instead of runtime.

You write your JavaScript in `.@js` files, and by default, all the code in the file will be evaluated at runtime.

But, if the line starts with an `@` or if it contains `@{}`, those parts of the file will be switched out, and run at build-time instead.

The code evaluated at buildtime is also JavaScript.

## Contrived example:

```js
// @hello-world.@js
@var hi = 0;

@for (let i = 0; i < 5; i++) {
  console.log("Hello World @{i}");
  @hi++;
@}

module.exports = @{hi};
```

After we run it through `atbuild ./@hello-world.@js`, it becomes:

```js
// hello-world.js

console.log("Hello World 0");
console.log("Hello World 1");
console.log("Hello World 2");
console.log("Hello World 3");
console.log("Hello World 4");

module.exports = 5;
```

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
atbuild ./input.@js
```

## Webpack Loader

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
        // File extension is .@js
        test: /\.@js$/,
        exclude: /node_modules/,
        type: "javascript/auto",
        use: [
          // It needs to run before babel-loader
          {
            loader: "atbuild/webpack-loader
          },
          // Run Babel afterwards
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

### Next.js

## CLI
