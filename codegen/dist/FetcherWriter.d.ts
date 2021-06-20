/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLInterfaceType, GraphQLNamedType, GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { ImportingBehavior, Writer } from "./Writer";
export declare class FetcherWriter extends Writer {
    private readonly modelType;
    private readonly fetcherTypeName;
    private readonly fetchableTypeName;
    private readonly methodNames;
    private readonly defaultFetcherProps;
    readonly emptyFetcherName: string;
    readonly defaultFetcherName: string | undefined;
    constructor(modelType: GraphQLObjectType | GraphQLInterfaceType, stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected importingBehavior(type: GraphQLNamedType): ImportingBehavior;
    protected writeCode(): void;
    private writePositiveProp;
    private writeNegativeProp;
    private writeFetchable;
    private writeInstances;
}
export declare function generatedFetcherTypeName(fetcherType: GraphQLObjectType | GraphQLInterfaceType, config: GeneratorConfig): string;
export declare function generatedFetchableTypeName(fetcherType: GraphQLObjectType | GraphQLInterfaceType, config: GeneratorConfig): string;
