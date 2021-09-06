/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLSchema } from "graphql";
import { GeneratorConfig } from "../GeneratorConfig";
import { Writer } from "../Writer";
export declare class RelayWriter extends Writer {
    private schema;
    constructor(schema: GraphQLSchema, stream: WriteStream, config: GeneratorConfig);
    protected isUnderGlobalDir(): boolean;
    protected writeCode(): void;
}
