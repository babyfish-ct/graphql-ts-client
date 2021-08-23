/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLField } from "graphql";
import { AbstractHookWriter as AbstractOperationWriter } from "../AbstractOperationWriter";
import { GeneratorConfig } from "../GeneratorConfig";
export declare class RelayHookWriter extends AbstractOperationWriter {
    protected readonly hasTypedHooks: boolean;
    protected readonly hasSimpleHooks: boolean;
    constructor(operationType: "Query" | "Mutation", fields: GraphQLField<unknown, unknown>[], stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected writeCode(): void;
    private writeTypedOperation;
    private writeSimpleOperation;
    private writeOperationImpl;
}
