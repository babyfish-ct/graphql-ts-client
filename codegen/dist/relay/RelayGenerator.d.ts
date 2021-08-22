/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType, GraphQLUnionType } from "graphql";
import { FetcherWriter } from "../FetcherWriter";
import { Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { InheritanceInfo } from "../InheritanceInfo";
export declare class RelayGenerator extends Generator {
    constructor(config: GeneratorConfig);
    protected createFetcheWriter(modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType, inheritanceInfo: InheritanceInfo, stream: WriteStream, config: GeneratorConfig): FetcherWriter;
    protected generateServices(queryFields: GraphQLField<unknown, unknown>[], mutationFields: GraphQLField<unknown, unknown>[], promises: Promise<void>[]): Promise<void>;
    private generateQueries;
    private generateMutations;
    private generateRelayFragment;
}
