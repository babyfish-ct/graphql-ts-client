/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLField } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";
export declare abstract class AbstractHookWriter extends Writer {
    protected hookType: "Query" | "Mutation";
    protected fields: GraphQLField<unknown, unknown>[];
    protected readonly hasTypedHooks: boolean;
    protected readonly hasSimpleHooks: boolean;
    protected constructor(hookType: "Query" | "Mutation", fields: GraphQLField<unknown, unknown>[], stream: WriteStream, config: GeneratorConfig);
    protected writeVariables(): void;
    protected writeFetchableTypes(): void;
    protected writeFetchedTypes(): void;
    protected writeSimpleTypes(): void;
    protected writeGQLParameters(): void;
    protected writeGQLArguments(): void;
}
