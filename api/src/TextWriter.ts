export class TextWriter {

    private newLine: boolean = false;

    private result: string = "";

    private scopes: Scope[] = [];

    constructor(private indent: string = '\t') {}

    text(value: string) {
        const index = value.indexOf('\n');
        let str: string | undefined;
        let rest: string | undefined;
        if (index === -1) {
            str = value.substring(0, index);
            rest = value.substring(index + 1);
        } else {
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

    scope(props: {readonly type: ScopeType, readonly multiLines?: boolean, readonly seperator?: string}, action: () => void) {
        let seperator: string | undefined = props.seperator;
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
        } finally {
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

    seperator(sperator?: string) {
        const scope = this.currentScope();
        if (scope === undefined) {
            throw new Error("No existing scope");
        }
        if (scope.dirty) {
            if (sperator !== undefined && sperator.length !== 0) {
                this.text(sperator);
            } else if (scope.seperator !== undefined) {
                this.text(scope.seperator);
            }
            if (scope.multiLines) {
                this.addLineTerminator();
            }
        }
    }

    toString(): string {
        return this.result;
    }

    private addIndent() {
        if (this.newLine) {
            let totalIndent = "";
            for (let i = this.scopes.length; i > 0; --i) {
                totalIndent += this.indent;
            }
            this.result += totalIndent;
            this.newLine = false;
        }
    }

    private addLineTerminator() {
        this.result += '\n';
        this.newLine = true;
    }

    private addText(text: string) {
        if (text.length !== 0) {
            this.result += text;
            const scope = this.currentScope();
            if (scope !== undefined) {
                scope.dirty = true;
            }
        }
    }

    private currentScope(): Scope | undefined {
        const arr = this.scopes;
        if (arr.length === 0) {
            return undefined; 
        }
        return arr[arr.length - 1];
    }
}

export type ScopeType = "BLOCK" | "ARGUMENTS" | "ARRAY";

interface Scope {
    readonly type: ScopeType;
    readonly multiLines: boolean;
    readonly seperator: string | undefined;
    dirty: boolean;
}
