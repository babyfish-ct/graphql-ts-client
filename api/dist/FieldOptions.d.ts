export interface FieldOptions<TAlias extends string, TDirectives extends object> {
    alias<XAlias extends string>(alias: XAlias): FieldOptions<XAlias, TDirectives>;
    directive<XDirective extends string, XArgs extends object = {}>(directive: XDirective, args?: XArgs): FieldOptions<TAlias, TDirectives & {
        readonly [key in XDirective]: XArgs;
    }>;
    readonly value: FieldOptionsValue<TAlias, TDirectives>;
}
export interface FieldOptionsValue<TAlias extends string, TDirectives extends object> {
    readonly alias?: TAlias;
    readonly directives: TDirectives;
}
export declare const fieldOptions: FieldOptions<"", {}>;
export declare function isFieldOptions(options: any): boolean;
