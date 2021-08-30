import { DirectiveArgs } from "./Fetcher";
import { UnresolvedVariables } from "./Parameter";

export interface FieldOptions<
    TAlias extends string, 
    TDirectives extends { readonly [key: string]: DirectiveArgs },
    TDirectiveVaraibles extends object
> {
    
    alias<XAlias extends string>(alias: XAlias): FieldOptions<XAlias, TDirectives, TDirectiveVaraibles>;

    directive<
        XDirective extends string, 
        XArgs extends DirectiveArgs = {}
    >(
        directive: XDirective, 
        args?: XArgs
    ): FieldOptions<
        TAlias, 
        TDirectives & { readonly [key in XDirective]: XArgs },
        TDirectiveVaraibles & UnresolvedVariables<XArgs, Record<keyof XArgs, any>>
    >;

    invisibleDirective<
        XDirective extends string, 
        XArgs extends DirectiveArgs = {}
    >(
        directive: XDirective, 
        args?: XArgs
    ): FieldOptions<
        TAlias, 
        TDirectives & { readonly [key in XDirective]: XArgs },
        TDirectiveVaraibles & UnresolvedVariables<XArgs, Record<keyof XArgs, any>>
    >;

    readonly value: FieldOptionsValue;
}

class FieldOptionsImpl<
    TAlias extends string, 
    TDirectives extends { readonly [key: string]: DirectiveArgs },
    TDirectiveVaraibles extends object
> implements FieldOptions<TAlias, TDirectives, TDirectiveVaraibles> {

    private _value?: FieldOptionsValue;

    constructor(
        private _prev?: FieldOptionsImpl<string, any, any>, 
        private _alias?: string, 
        private _directive?: string,
        private _directiveArgs?: object,
        private _invisibleDirective?: string,
        private _invisibleDirectiveArgs?: object
    ) {
    }

    alias<XAlias extends string>(alias: XAlias): FieldOptions<XAlias, TDirectives, TDirectiveVaraibles> {
        return new FieldOptionsImpl<XAlias, TDirectives, TDirectiveVaraibles>(this, alias);
    }

    directive<
        XDirective extends string, 
        XArgs extends DirectiveArgs = {}
    >(
        directive: XDirective, 
        args?: XArgs
    ): FieldOptions<
        TAlias, 
        TDirectives & { readonly [key in XDirective]: XArgs},
        TDirectiveVaraibles & UnresolvedVariables<XArgs, Record<keyof XArgs, any>>
    > {
        if (directive.startsWith("@")) {
            throw new Error("directive name should not start with '@' because it will be prepended by this framework automatcially"); 
        }
        return new FieldOptionsImpl<
            TAlias, 
            TDirectives & { readonly [key in XDirective]: XArgs},
            TDirectiveVaraibles & UnresolvedVariables<XArgs, XArgs>
        >(this, undefined, directive, args);
    }

    invisibleDirective<
        XDirective extends string, 
        XArgs extends DirectiveArgs = {}
    >(
        directive: XDirective, 
        args?: XArgs
    ): FieldOptions<
        TAlias, 
        TDirectives & { readonly [key in XDirective]: XArgs},
        TDirectiveVaraibles & UnresolvedVariables<XArgs, Record<keyof XArgs, any>>
    > {
        if (directive.startsWith("@")) {
            throw new Error("directive name should not start with '@' because it will be prepended by this framework automatcially"); 
        }
        return new FieldOptionsImpl<
            TAlias, 
            TDirectives & { readonly [key in XDirective]: XArgs},
            TDirectiveVaraibles & UnresolvedVariables<XArgs, XArgs>
        >(this, undefined, undefined, undefined, directive, args);
    }

    get value(): FieldOptionsValue {
        let v = this._value;
        if (v === undefined) {
            this._value = v = this.createValue();
        }
        return v;
    }

    private createValue(): FieldOptionsValue {
        let alias: string | undefined = undefined;
        const directives = new Map<string, DirectiveArgs>();
        const invisibleDirectives = new Map<string, DirectiveArgs>();
        for (let options: FieldOptionsImpl<string, any, any> | undefined = this; options !== undefined; options = options._prev) {
            if (options._alias !== undefined && alias === undefined) {
                alias = options._alias;
            }
            if (options._directive !== undefined && !directives.has(options._directive)) {
                const args = options._directiveArgs;
                directives.set(options._directive, args !== undefined && Object.keys(args).length !== 0 ? args : undefined);
            }
            if (options._invisibleDirective !== undefined && !invisibleDirectives.has(options._invisibleDirective)) {
                if (directives.has(options._invisibleDirective)) {
                    throw new Error(`'${options._invisibleDirective}' is used both directive and invisible directive`);
                }
                const args = options._invisibleDirectiveArgs;
                invisibleDirectives.set(options._invisibleDirective, args !== undefined && Object.keys(args).length !== 0 ? args : undefined);
            }
        }
        return { alias, directives, invisibleDirectives };
    }
}

export interface FieldOptionsValue {
    readonly alias?: string;
    readonly directives: ReadonlyMap<string, DirectiveArgs>;
    readonly invisibleDirectives: ReadonlyMap<string, DirectiveArgs>;
}

export function createFieldOptions<TAlias extends string>(): FieldOptions<TAlias, {}, {}> {
    return new FieldOptionsImpl<TAlias, {}, {}>();
}