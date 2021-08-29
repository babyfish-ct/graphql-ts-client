import { DirectiveArgs } from "./Fetcher";
export interface FieldOptions<TAlias extends string, TDirectives extends {
    readonly [key: string]: DirectiveArgs;
}> {
    alias<XAlias extends string>(alias: XAlias): FieldOptions<XAlias, TDirectives>;
    directive<XDirective extends string, XArgs extends DirectiveArgs = {}>(directive: XDirective, args?: XArgs): FieldOptions<TAlias, TDirectives & {
        readonly [key in XDirective]: XArgs;
    }>;
    invisibleDirective<XDirective extends string, XArgs extends DirectiveArgs = {}>(directive: XDirective, args?: XArgs): FieldOptions<TAlias, TDirectives & {
        readonly [key in XDirective]: XArgs;
    }>;
    readonly value: FieldOptionsValue;
}
export interface FieldOptionsValue {
    readonly alias?: string;
    readonly directives: ReadonlyMap<string, DirectiveArgs>;
    readonly invisibleDirectives: ReadonlyMap<string, DirectiveArgs>;
}
export declare function createFieldOptions<TAlias extends string>(): FieldOptions<TAlias, {}>;
