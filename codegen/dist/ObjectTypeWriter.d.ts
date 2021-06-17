/// <reference types="node" />
import { WriteStream } from "fs";
import { GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";
export declare class ObjectTypeWriter extends Writer {
    private objectType;
    constructor(objectType: GraphQLObjectType, stream: WriteStream, config: GeneratorConfig);
    write(): void;
}
