/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLField } from "graphql";
import { GeneratorConfig } from "../GeneratorConfig";
import { Writer } from "../Writer";
export declare class RelayWriter extends Writer {
    private queryFields;
    private readonly nodeField?;
    private readonly noNodeFieldError?;
    private readonly nodeTypeName?;
    constructor(queryFields: GraphQLField<unknown, unknown>[], stream: WriteStream, config: GeneratorConfig);
    protected isUnderGlobalDir(): boolean;
    protected prepareImportings(): void;
    protected writeCode(): void;
    private writeBuildRefetchQueryRequest;
}
