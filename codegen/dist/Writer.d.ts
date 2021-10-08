/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLNamedType, GraphQLObjectType, GraphQLType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
export declare abstract class Writer {
    private stream;
    protected config: GeneratorConfig;
    private scopes;
    protected readonly indent: string;
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
    protected enter(type: ScopeType, multiLines?: boolean, prefix?: string): void;
    protected leave(suffix?: string): void;
    protected scope(args: ScopeArgs, scopeAction: () => void): void;
    protected text(value: string): void;
    protected str(value: string): void;
    protected separator(value?: string): void;
    protected varableDecl(name: string, type: GraphQLType, overrideObjectTypeName?: string): void;
    protected typeRef(type: GraphQLType, objectRender?: string | ((type: GraphQLObjectType | GraphQLInterfaceType, field: GraphQLField<any, any>) => boolean)): void;
    protected gqlTypeRef(type: GraphQLType): void;
    protected isUnderGlobalDir(): boolean;
    private writeIndent;
    private get currentScope();
}
export declare type ScopeType = "BLANK" | "BLOCK" | "PARAMETERS" | "ARRAY" | "GENERIC";
export declare type ImportingBehavior = "SELF" | "SAME_DIR" | "OTHER_DIR";
export interface ScopeArgs {
    readonly type: ScopeType;
    readonly multiLines?: boolean;
    readonly prefix?: string;
    readonly suffix?: string;
}
