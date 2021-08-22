/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLField } from "graphql";
import { GeneratorConfig } from "../GeneratorConfig";
import { Writer } from "../Writer";
export declare class RelayHookWriter extends Writer {
    private hookType;
    private fields;
    protected readonly hasTypedHooks: boolean;
    protected readonly hasSimpleHooks: boolean;
    constructor(hookType: "Query" | "Mutation", fields: GraphQLField<unknown, unknown>[], stream: WriteStream, config: GeneratorConfig);
    protected writeCode(): void;
}
