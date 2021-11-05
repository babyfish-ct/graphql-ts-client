/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from "graphql";
import { FetcherContext } from "../FetcherContext";
import { Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { RelayFetcherWriter } from "./RelayFetcherWriter";
export declare class RelayGenerator extends Generator {
    constructor(config: GeneratorConfig);
    protected createFetcheWriter(modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, ctx: FetcherContext, stream: WriteStream, config: GeneratorConfig): RelayFetcherWriter;
    protected generateServices(ctx: FetcherContext, promises: Promise<void>[]): Promise<void>;
    generateRelayCode(schema: GraphQLSchema): Promise<void>;
    protected writeIndexCode(stream: WriteStream, schema: GraphQLSchema): void;
}
