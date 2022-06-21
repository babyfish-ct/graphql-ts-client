/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLSchema } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";
export declare class EnumInputMetadataWriter extends Writer {
    private schema;
    constructor(schema: GraphQLSchema, stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected writeCode(): void;
    private collectEnumMetaTypes;
    private static inputTypeName;
}
