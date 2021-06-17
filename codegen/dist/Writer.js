"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Writer = void 0;
class Writer {
    constructor(stream, config) {
        var _a;
        this.stream = stream;
        this.config = config;
        this.scopeTypes = [];
        this.needIndent = false;
        this.indent = (_a = this.config.indent) !== null && _a !== void 0 ? _a : "\t";
    }
    enter(scopeType) {
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
    leave() {
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
    text(value) {
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
    writeIndent() {
        for (let i = this.scopeTypes.length; i > 0; --i) {
            this.stream.write(this.indent);
        }
    }
}
exports.Writer = Writer;
