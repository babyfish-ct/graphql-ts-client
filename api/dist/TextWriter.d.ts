export declare class TextWriter {
    private indent;
    private newLine;
    private result;
    private scopes;
    constructor(indent?: string);
    text(value: string): void;
    scope(props: {
        readonly type: ScopeType;
        readonly multiLines?: boolean;
        readonly seperator?: string;
        readonly prefix?: string;
        readonly suffix?: string;
    }, action: () => void): void;
    seperator(sperator?: string): void;
    toString(): string;
    private addIndent;
    private addLineTerminator;
    private currentScope;
}
export declare type ScopeType = "BLOCK" | "ARGUMENTS" | "ARRAY";
