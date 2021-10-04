/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from "graphql";
import { FetcherContext } from "../FetcherContext";
import { FetcherWriter } from "../FetcherWriter";
import { Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
export declare class RelayGenerator extends Generator {
    constructor(config: GeneratorConfig);
    protected createFetcheWriter(modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, ctx: FetcherContext, stream: WriteStream, config: GeneratorConfig): FetcherWriter;
    protected generateServices(ctx: FetcherContext, promises: Promise<void>[]): Promise<void>;
    generateRelayCode(schema: GraphQLSchema): Promise<void>;
    protected writeIndexCode(stream: WriteStream, schema: GraphQLSchema): Promise<void>;
}
