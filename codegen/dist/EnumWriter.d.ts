/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLEnumType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";
export declare class EnumWriter extends Writer {
    private enumType;
    constructor(enumType: GraphQLEnumType, stream: WriteStream, config: GeneratorConfig);
    protected writeCode(): void;
}
