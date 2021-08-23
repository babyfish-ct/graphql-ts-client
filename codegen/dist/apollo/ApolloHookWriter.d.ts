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
import { AbstractHookWriter } from "../AbstractOperationWriter";
import { GeneratorConfig } from "../GeneratorConfig";
export declare class ApolloHookWriter extends AbstractHookWriter {
    constructor(operationType: "Query" | "Mutation", fields: GraphQLField<unknown, unknown>[], stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected writeCode(): void;
    private writeTypedHook;
    private writeSimpleHook;
    private writeReturnOrOptionsGenericArgs;
    private writeRequestDeclaration;
    private writeDependencyRegistry;
    private writeDependencyTrigger;
}
