/// <reference types="node" />
import { WriteStream } from "fs";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";
export declare class GraphQLClientWriter extends Writer {
    constructor(stream: WriteStream, config: GeneratorConfig);
    protected prepareImportings(): void;
    protected writeCode(): void;
}
