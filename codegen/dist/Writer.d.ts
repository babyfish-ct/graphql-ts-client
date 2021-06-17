/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLField, GraphQLNamedType, GraphQLType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
export declare abstract class Writer {
    private stream;
    protected config: GeneratorConfig;
    private scopes;
    private indent;
    private needIndent;
    private importStatements;
    private importedTypes;
    private imported;
    constructor(stream: WriteStream, config: GeneratorConfig);
    write(): void;
    protected prepareImportings(): void;
    protected abstract writeCode(): any;
    protected importFieldTypes(field: GraphQLField<unknown, unknown>): void;
    protected importType(type: GraphQLType): void;
    protected importStatement(statement: string): void;
    protected importingBehavior(type: GraphQLNamedType): ImportingBehavior;
    protected enter(type: ScopeType, multiLines?: boolean): void;
    protected leave(): void;
    protected text(value: string): void;
    protected separator(value?: string): void;
    protected typeRef(type: GraphQLType, overrideObjectTypeName?: string): void;
    private writeIndent;
    private get currentScope();
}
export declare type ScopeType = "BLANK" | "BLOCK" | "PARAMETERS";
export declare type ImportingBehavior = "SELF" | "SAME_DIR" | "OTHER_DIR";
