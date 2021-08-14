/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLField } from "graphql";
import { GeneratorConfig } from "../GeneratorConfig";
import { ApolloHookWriter } from "./ApolloHookWriter";
export declare class ApolloMutationHookWriter extends ApolloHookWriter {
    constructor(fields: GraphQLField<unknown, unknown>[], stream: WriteStream, config: GeneratorConfig);
}
