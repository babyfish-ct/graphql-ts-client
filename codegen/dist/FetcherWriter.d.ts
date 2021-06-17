/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLInterfaceType, GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";
export declare class FetcherWriter extends Writer {
    private modelType;
    private fetcherSuffix;
    constructor(modelType: GraphQLObjectType | GraphQLInterfaceType, stream: WriteStream, config: GeneratorConfig);
    write(): void;
    private writePositiveProp;
    private writeNegativeProp;
}
export declare const DEFAULT_FETCHER_SUBFFIX = "Fetcher";
