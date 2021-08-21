export class TextWriter {

    private newLine: boolean = false;

    private result: string = "";

    private scopes: Scope[] = [];

    constructor(private indent: string = '\t') {}

    text(value: string) {
        const scope = this.currentScope();
        if (value.length !== 0 && scope !== undefined && scope.dirty === false) {
            if (scope.multiLines) {
                this.addLineTerminator();
            }
            scope.dirty = true;
        }
        let str: string = value;
        while (str.length !== 0) {
            this.addIndent();
            const index = str.indexOf('\n');
            if (index !== -1) {
                this.result += str.substring(0, index);
                this.addLineTerminator();
                str = str.substring(index + 1);
            } else {
                this.result += str;
                str = "";
            }
        }
    }

    scope(
        props: {
            readonly type: ScopeType, 
            readonly multiLines?: boolean, 
            readonly seperator?: string,
            readonly prefix?: string,
            readonly suffix?: string
        },
        action: () => void
    ) {
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
        if (props.prefix !== undefined) {
            this.text(props.prefix);
        }
        switch (props.type) {
            case 'BLOCK':
                this.text('{');
                break;
            case 'ARGUMENTS':
                this.text('(');
                break;
            case 'ARRAY':
                this.text('[');
                break;    
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
                    this.text('}');
                    break;
                case 'ARGUMENTS':
                    this.text(')');
                    break;
                case 'ARRAY':
                    this.text(']');
                    break;
            }
            if (props.suffix !== undefined) {
                this.text(props.suffix);
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
