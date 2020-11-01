const PACKAGE_JSON_CONTENTS =
  '{\n  "name": "atbuild",\n  "version": "1.3.3",\n  "main": "dist/atbuild.js",\n  "browser": "web/atbuild.js",\n  "license": "MIT",\n  "files": [\n    "./README.md",\n    "./package.json",\n    "dist",\n    "web",\n    "./webpack-loader.js",\n    "./index.js"\n  ],\n  "bin": {\n    "atbuild": "./dist/cli.js"\n  },\n  "devDependencies": {\n    "@babel/cli": "^7.11.6",\n    "@babel/core": "^7.11.6",\n    "@babel/preset-env": "^7.11.5",\n    "@babel/preset-typescript": "^7.12.1",\n    "@types/jest": "^26.0.15",\n    "@types/webpack": "^4.41.24",\n    "babel-jest": "^26.5.2",\n    "babel-loader": "^8.1.0",\n    "jest": "^26.5.3",\n    "jest-cli": "^26.5.3",\n    "lodash": "^4.17.20",\n    "memfs": "^3.2.0",\n    "node-fetch": "^2.6.1",\n    "prettier": "^2.1.2",\n    "rimraf": "^3.0.2",\n    "typescript": "^4.0.5",\n    "webpack": "^5.0.0"\n  },\n  "peerDependencies": {\n    "typescript": "^4.0.5",\n    "webpack": "^5.0.0"\n  },\n  "optionalDependencies": {\n    "prettier": "^2.1.2",\n    "vscode-languageserver": "^6.1.1"\n  },\n  "scripts": {\n    "test": "jest",\n    "clear-test": "rm samples/*.d.ts",\n    "update-readme": "node dist/cli.js ./README.md.jsb ./README.md",\n    "build-node": "babel src --extensions \\".ts\\" --extensions \\".js\\" --ignore=./**/*.test.js -d dist --delete-dir-on-start",\n    "build": "yarn build-node && yarn build-web",\n    "build-web": "esbuild --define:\\"process.env.WEB=true\\" --bundle ./src/atbuild.js --format=esm  --outdir=./web ",\n    "prepublishOnly": "yarn build",\n    "compile-vscode-client": "babel --config-file=./babel.config.js --extensions \\".ts\\" ./atbuild-vscode/client/src --ignore=atbuild-vscode/**/*.test.js -d ./atbuild-vscode/client/out --delete-dir-on-start",\n    "compile-vscode-server": "babel --config-file=./babel.config.js --extensions \\".ts\\" ./atbuild-vscode/server/src --ignore=atbuild-vscode/**/*.test.js -d ./atbuild-vscode/server/out --delete-dir-on-start",\n    "compile-vscode": "yarn --silent compile-vscode-client && yarn --silent compile-vscode-server",\n    "precompile-vscode": "yarn build",\n    "postcompile-vscode": "cp dist/atbuild.js ./atbuild-vscode/client/out/atbuild.js; cp dist/atbuild.js ./atbuild-vscode/server/out/atbuild.js"\n  },\n  "dependencies": {\n    "esbuild": "https://github.com/Jarred-Sumner/esbuild/releases/download/pluginbuild/esbuild-0.8.1.tgz",\n    "loader-utils": "^2.0.0",\n    "meow": "^7.1.1"\n  }\n}\n';
const didRemoveBuildTimeCode = true;
