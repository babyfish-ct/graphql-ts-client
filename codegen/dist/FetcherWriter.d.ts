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
import { GraphQLArgument, GraphQLFieldMap, GraphQLInterfaceType, GraphQLNamedType, GraphQLObjectType, GraphQLUnionType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { ImportingBehavior, Writer } from "./Writer";
import { FetcherContext } from "./FetcherContext";
export declare class FetcherWriter extends Writer {
    protected modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;
    protected ctx: FetcherContext;
    protected readonly fetcherTypeName: string;
    protected readonly defaultFetcherProps: string[];
    readonly emptyFetcherName: string;
    readonly defaultFetcherName: string | undefined;
    readonly fieldMap: GraphQLFieldMap<any, any>;
    protected fieldArgsMap: Map<string, GraphQLArgument[]>;
    protected fieldCategoryMap: Map<string, string>;
    protected hasArgs: boolean;
    private _declaredFieldNames?;
    constructor(modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, ctx: FetcherContext, stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected importedNamesForSuperType(superType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType): string[];
    protected importingBehavior(type: GraphQLNamedType): ImportingBehavior;
    protected writeCode(): void;
    protected writeFragmentMethods(): void;
    private writeDirective;
    private writeTypeName;
    private writePositiveProp;
    private writeNegativeProp;
    private writePositivePropImpl;
    private writePositivePropChangedDataType;
    private writeInstances;
    private writeArgsInterface;
    protected get declaredFieldNames(): ReadonlySet<string>;
    private getDeclaredFieldNames;
    private removeSuperFieldNames;
    private superFetcherTypeName;
}
