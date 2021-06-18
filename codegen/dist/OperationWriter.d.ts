/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLField } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";
export declare class OperationWriter extends Writer {
    private readonly mutation;
    private readonly field;
    private readonly argsWrapperName?;
    private readonly associatedTypes;
    constructor(mutation: boolean, field: GraphQLField<unknown, unknown>, stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected writeCode(): void;
    private writeArgsWrapperType;
    private writeGQL;
    private writeRequestExpression;
    private writeGQLTypeRef;
}
export declare function argsWrapperTypeName(field: GraphQLField<unknown, unknown>): string | undefined;
