/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLInputObjectType, GraphQLNamedType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { ImportingBehavior, Writer } from "./Writer";
export declare class InputWriter extends Writer {
    private readonly inputType;
    constructor(inputType: GraphQLInputObjectType, stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected importingBehavior(type: GraphQLNamedType): ImportingBehavior;
    protected writeCode(): void;
}
