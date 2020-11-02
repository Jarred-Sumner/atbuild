declare const PACKAGE_JSON_CONTENTS: {
    name: string;
    version: string;
    main: string;
    browser: string;
    license: string;
    types: string;
    files: string[];
    bin: {
        atbuild: string;
    };
    devDependencies: {
        "@babel/cli": string;
        "@babel/core": string;
        "@babel/preset-env": string;
        "@babel/preset-typescript": string;
        "@types/jest": string;
        "@types/webpack": string;
        "babel-jest": string;
        "babel-loader": string;
        jest: string;
        "jest-cli": string;
        lodash: string;
        memfs: string;
        "node-fetch": string;
        rimraf: string;
        typescript: string;
        webpack: string;
    };
    peerDependencies: {
        typescript: string;
        webpack: string;
    };
    optionalDependencies: {
        "vscode-languageserver": string;
    };
    scripts: {
        test: string;
        cli: string;
        "clear-test": string;
        "update-readme": string;
        "prebuild-node": string;
        "prebuild-web": string;
        "build-node": string;
        postbuild: string;
        build: string;
        "build-web": string;
        "build-types": string;
        prepublishOnly: string;
        "compile-vscode-client": string;
        "compile-vscode-server": string;
        "compile-vscode": string;
        "precompile-vscode": string;
        "postcompile-vscode": string;
    };
    dependencies: {
        esbuild: string;
        "loader-utils": string;
        meow: string;
    };
};
declare const didRemoveBuildTimeCode = true;
