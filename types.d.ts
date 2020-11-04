/// <reference types="node" />
declare module "atbuild" {
    export let requireFromString: any;
    export class AtBuild {
        static buildAST(code: any): any[];
        static transformASTBuildTimeOnly(nodes: any): string;
        static transformAST(nodes: any, asFunction: any, exposeFunctions?: boolean): string;
        static findNodesAtLine(nodes: any, lineNumber: any): Generator<any, void, unknown>;
        static ASTResponseType: {
            BuildtimeCode: number;
            RuntimeCode: number;
        };
        static transformASTForLineColumn(nodes: any, lineNumber: any, column: any, response: any): void;
        static extractSourceAndType(code: any, filepath: any, line: any, column: any, response: any): void;
        static evalFile(path: any, header: any): any;
        static evalFileAsync(path: any, header: any): Promise<any>;
        static _eval(code: any, filepath?: string, addHeader?: boolean, requireFunc?: NodeJS.Require): any;
        static eval(code: string, filepath?: string, addHeader?: boolean, requireFunc?: NodeJS.Require): any;
        static evalAsync(code: string, filepath?: string, addHeader?: boolean, requireFunc?: NodeJS.Require): Promise<any>;
    }
    const _AtBuild: typeof AtBuild;
    export { $ };
    export default _AtBuild;
}
declare module "atbuild.test" { }
declare module "bundle" {
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
    export function bundle(source: string, { format, mode, filepath, defaultMode, typescript, destination, readFile, writeFile: _writeFile, }: BundleInput): Promise<string>;
}
declare var __defProp: (o: any, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => any;
declare var __markAsModule: (target: any) => any;
declare var __export: (target: any, all: any) => void;
declare var CharacterType: any;
declare const CHARACTER_TYPES: Uint8Array;
declare module "light" {
    export enum ASTNodeType {
        runtimeLineStart = 0,
        runtimeLineEnd = 1,
        buildTimeCode = 2,
        runtimeCode = 3,
        buildTimeLine = 4,
        multilineBuildTimeLine = 5,
        runtimeLine = 6
    }
    export type ASTNode = {
        type: ASTNodeType;
        value: string;
        line: number;
    };
    export class ASTNodeList extends Array<ASTNode> {
        buildNodeCount: number;
        runtimeLineCount: number;
        maxLine: number;
    }
    export function quickTest(source: string): boolean;
    export function buildAST(source: string, emptyFunctionNameReplacer?: string): ASTNodeList;
    export function transformAST(nodes: ASTNodeList): string;
    export function transform(source: string): string;
}
declare module "light.test" { }
declare module "typings-plugin/generateTypings" {
    export let baseTypings: {
        noEmit: boolean;
        noEmitOnError: boolean;
        declaration: boolean;
        declarationMap: boolean;
        allowJs: boolean;
        skipLibCheck: boolean;
        strict: boolean;
        downlevelIteration: boolean;
        esModuleInterop: boolean;
        allowSyntheticDefaultImports: boolean;
        jsx: string;
        emitDeclarationOnly: boolean;
        extensions: {
            "**/*.ts": string;
            "**/*.js": string;
            "**/*.jsb": string;
            "**/*.@js": string;
            "**/*.@ts": string;
            "**/*.tsb": string;
        };
    };
    export function generateTypings(filenames: string[], options: any, readFile: (fileName: string) => string | undefined, writeFile: (fileName: string, content: string) => void): void;
}