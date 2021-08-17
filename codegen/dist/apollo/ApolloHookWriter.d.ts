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
export declare class ApolloHookWriter extends Writer {
    private hookType;
    private fields;
    protected readonly hasTypedHooks: boolean;
    protected readonly hasSimpleHooks: boolean;
    constructor(hookType: "Query" | "Mutation", fields: GraphQLField<unknown, unknown>[], stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected isUnderGlobalDir(): boolean;
    protected writeCode(): void;
    private writeTypedHook;
    private writeSimpleHook;
    private writeReturnOrOptionsGenericArgs;
    private writeRequestDeclaration;
    private writeDependencyRegistry;
    private writeDependencyTrigger;
    private writeVariables;
    private writeFetchableTypes;
    private writeFetchedTypes;
    private writeSimpleTypes;
    private writeGQLParameters;
    private writeGQLArguments;
}
