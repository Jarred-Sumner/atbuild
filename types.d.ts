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
    export function buildAST(source: string): ASTNodeList;
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
