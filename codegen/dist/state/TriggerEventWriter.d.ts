/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "../GeneratorConfig";
import { Writer } from "../Writer";
export declare class TriggerEventWiter extends Writer {
    private modelType;
    private idField;
    private simpleFieldNames;
    private parameterizedFieldNames;
    constructor(modelType: GraphQLObjectType | GraphQLInterfaceType, idField: GraphQLField<any, any> | undefined, stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected writeCode(): void;
    private writeEventKey;
    private writeEventFieldNames;
}
