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
import { GraphQLFieldMap, GraphQLInterfaceType, GraphQLNamedType, GraphQLObjectType, GraphQLUnionType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { InheritanceInfo } from "./InheritanceInfo";
import { ImportingBehavior, Writer } from "./Writer";
export declare class FetcherWriter extends Writer {
    private relay;
    private readonly modelType;
    private inheritanceInfo;
    private readonly fetcherTypeName;
    private readonly defaultFetcherProps;
    readonly emptyFetcherName: string;
    readonly defaultFetcherName: string | undefined;
    readonly fieldMap: GraphQLFieldMap<any, any>;
    private methodFields;
    private pluralFields;
    private hasArgs;
    constructor(relay: boolean, modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, inheritanceInfo: InheritanceInfo, stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected importingBehavior(type: GraphQLNamedType): ImportingBehavior;
    protected writeCode(): void;
    private writePositiveProp;
    private writeNegativeProp;
    private writeInstances;
    private writeArgsTypesInterface;
    private declaredFieldNames;
    private removeSuperFieldNames;
}
export declare function generatedFetcherTypeName(fetcherType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, config: GeneratorConfig): string;
