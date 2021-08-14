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
import { GraphQLField } from "graphql";
import { GeneratorConfig } from "../GeneratorConfig";
import { Writer } from "../Writer";
export declare class AsyncOperationWriter extends Writer {
    private readonly mutation;
    private readonly field;
    private readonly argsWrapperName?;
    private readonly associatedType;
    constructor(mutation: boolean, field: GraphQLField<unknown, unknown>, stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected writeCode(): void;
    private writeArgsWrapperType;
    private writeGQL;
}
export declare function argsWrapperTypeName(field: GraphQLField<unknown, unknown>): string | undefined;
