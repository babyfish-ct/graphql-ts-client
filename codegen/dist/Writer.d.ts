/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
export declare abstract class Writer {
    private stream;
    protected config: GeneratorConfig;
    private scopes;
    private indent;
    private needIndent;
    constructor(stream: WriteStream, config: GeneratorConfig);
    abstract write(): any;
    protected enter(type: ScopeType, multiLines?: boolean): void;
    protected leave(): void;
    protected text(value: string): void;
    protected separator(value?: string): void;
    protected typeRef(type: GraphQLType, overrideObjectTypeName?: string): void;
    private writeIndent;
    private get currentScope();
}
export declare type ScopeType = "NONE" | "BLOCK" | "PARAMETERS";
