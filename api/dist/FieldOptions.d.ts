import { DirectiveArgs } from "./Fetcher";
import { UnresolvedVariables } from "./Parameter";
export interface FieldOptions<TAlias extends string, TDirectives extends {
    readonly [key: string]: DirectiveArgs;
}, TDirectiveVaraibles extends object> {
    alias<XAlias extends string>(alias: XAlias): FieldOptions<XAlias, TDirectives, TDirectiveVaraibles>;
    directive<XDirective extends string, XArgs extends DirectiveArgs = {}>(directive: XDirective, args?: XArgs): FieldOptions<TAlias, TDirectives & {
        readonly [key in XDirective]: XArgs;
    }, TDirectiveVaraibles & UnresolvedVariables<XArgs, Record<keyof XArgs, any>>>;
    readonly value: FieldOptionsValue;
    " $supressWarnings"(alias: TAlias, directives: TDirectives, directiveVariables: TDirectiveVaraibles): void;
}
export interface FieldOptionsValue {
    readonly alias?: string;
    readonly directives: ReadonlyMap<string, DirectiveArgs>;
}
export declare function createFieldOptions<TAlias extends string>(): FieldOptions<TAlias, {}, {}>;
