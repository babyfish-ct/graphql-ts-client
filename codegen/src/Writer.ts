import { WriteStream } from "fs";
import { GeneratorConfig } from "./GeneratorConfig";

export abstract class Writer {

    private scopeTypes: ScopeType[] = [];

    private indent: string;

    private needIndent = false;
    
    constructor(
        private stream: WriteStream,
        protected config: GeneratorConfig,
    ) {
        this.indent = this.config.indent ?? "\t";
    }

    abstract write();

    protected enter(scopeType: ScopeType) {
        switch (scopeType) {
            case "BODY":
                this.stream.write("{");
                break;
            case "PARAMETERS":
                this.stream.write("(");
                break;
        }
        this.scopeTypes.push(scopeType);
    }

    protected leave() {
        const scopeType = this.scopeTypes.pop();
        switch (scopeType) {
            case "BODY":
                this.stream.write("}");
                break;
            case "PARAMETERS":
                this.stream.write(")");
                break;
        }
    }

    protected text(value: string) {
        const lines = value.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.length !== 0) {
                if (this.needIndent) {
                    this.writeIndent();
                    this.needIndent = false;
                }
                this.stream.write(line);
            }
            if (i + 1 < lines.length) {
                this.stream.write("\n");
                this.needIndent = true;
            }
        }
    }

    private writeIndent() {
        for (let i = this.scopeTypes.length; i > 0; --i) {
            this.stream.write(this.indent);
        }
    }
}

export type ScopeType = "BODY" | "PARAMETERS";