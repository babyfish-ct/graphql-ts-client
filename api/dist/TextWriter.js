"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextWriter = void 0;
class TextWriter {
    constructor(indent = '\t') {
        this.indent = indent;
        this.newLine = false;
        this.result = "";
        this.scopes = [];
    }
    text(value) {
        const index = value.indexOf('\n');
        let str;
        let rest;
        if (index === -1) {
            str = value.substring(0, index);
            rest = value.substring(index + 1);
        }
        else {
            str = value.substring(index + 1);
            rest = undefined;
        }
        while (str !== undefined) {
            this.addIndent();
            this.addText(str);
            if (rest !== undefined) {
                this.addLineTerminator();
            }
            str = rest;
        }
    }
    scope(props, action) {
        let seperator = props.seperator;
        if (seperator === undefined) {
            switch (props.type) {
                case 'ARGUMENTS':
                    seperator = ', ';
                    break;
                case 'ARRAY':
                    seperator = ', ';
                    break;
            }
        }
        switch (props.type) {
            case 'BLOCK':
                this.addText('{');
                break;
            case 'ARGUMENTS':
                this.addText('(');
                break;
            case 'ARRAY':
                this.addText('[');
                break;
        }
        if (props.multiLines) {
            this.addLineTerminator();
        }
        this.scopes.push({
            type: props.type,
            multiLines: !!props.multiLines,
            seperator,
            dirty: false
        });
        try {
            action();
        }
        finally {
            this.scopes.pop();
            if (props.multiLines && !this.newLine) {
                this.addLineTerminator();
            }
            switch (props.type) {
                case 'BLOCK':
                    this.addText('}');
                    break;
                case 'ARGUMENTS':
                    this.addText(')');
                    break;
                case 'ARRAY':
                    this.addText(']');
                    break;
            }
        }
    }
    seperator(sperator) {
        const scope = this.currentScope();
        if (scope === undefined) {
            throw new Error("No existing scope");
        }
        if (scope.dirty) {
            if (sperator !== undefined && sperator.length !== 0) {
                this.text(sperator);
            }
            else if (scope.seperator !== undefined) {
                this.text(scope.seperator);
            }
            if (scope.multiLines) {
                this.addLineTerminator();
            }
        }
    }
    toString() {
        return this.result;
    }
    addIndent() {
        if (this.newLine) {
            let totalIndent = "";
            for (let i = this.scopes.length; i > 0; --i) {
                totalIndent += this.indent;
            }
            this.result += totalIndent;
            this.newLine = false;
        }
    }
    addLineTerminator() {
        this.result += '\n';
        this.newLine = true;
    }
    addText(text) {
        if (text.length !== 0) {
            this.result += text;
            const scope = this.currentScope();
            if (scope !== undefined) {
                scope.dirty = true;
            }
        }
    }
    currentScope() {
        const arr = this.scopes;
        if (arr.length === 0) {
            return undefined;
        }
        return arr[arr.length - 1];
    }
}
exports.TextWriter = TextWriter;
