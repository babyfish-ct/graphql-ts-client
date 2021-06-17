/// <reference types="node" />
import { WriteStream } from "fs";
import { GeneratorConfig } from "./GeneratorConfig";
export declare abstract class Writer {
    private stream;
    protected config: GeneratorConfig;
    private scopeTypes;
    private indent;
    private needIndent;
    constructor(stream: WriteStream, config: GeneratorConfig);
    abstract write(): any;
    protected enter(scopeType: ScopeType): void;
    protected leave(): void;
    protected text(value: string): void;
    private writeIndent;
}
export declare type ScopeType = "BODY" | "PARAMETERS";
