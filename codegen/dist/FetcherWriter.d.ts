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
    private connectionTypes;
    private edgeTypes;
    private readonly fetcherTypeName;
    private readonly defaultFetcherProps;
    readonly emptyFetcherName: string;
    readonly defaultFetcherName: string | undefined;
    readonly fieldMap: GraphQLFieldMap<any, any>;
    private fieldArgsMap;
    private fieldCategoryMap;
    private hasArgs;
    constructor(relay: boolean, modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, inheritanceInfo: InheritanceInfo, connectionTypes: Set<GraphQLObjectType>, edgeTypes: Set<GraphQLObjectType>, stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected importingBehavior(type: GraphQLNamedType): ImportingBehavior;
    protected writeCode(): void;
    private writeFragment;
    private writeDirective;
    private writeTypeName;
    private writePositiveProp;
    private writeNegativeProp;
    private writePositivePropImpl;
    private writePositivePropChangedDataType;
    private writeInstances;
    private writeArgsInterface;
    private declaredFieldNames;
    private removeSuperFieldNames;
    private superFetcherTypeName;
}
