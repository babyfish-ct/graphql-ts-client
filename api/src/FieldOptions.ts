import { DirectiveArgs } from "./Fetcher";

export interface FieldOptions<TAlias extends string, TDirectives extends { readonly [key: string]: DirectiveArgs }> {
    
    alias<XAlias extends string>(alias: XAlias): FieldOptions<XAlias, TDirectives>;

    directive<
        XDirective extends string, 
        XArgs extends DirectiveArgs = {}>(
        directive: XDirective, 
        args?: XArgs
    ): FieldOptions<
        TAlias, 
        TDirectives & { readonly [key in XDirective]: XArgs }
    >;

    readonly value: FieldOptionsValue<TAlias, TDirectives>;
}

class FieldOptionsImpl<TAlias extends string, TDirectives extends { readonly [key: string]: DirectiveArgs }> implements FieldOptions<TAlias, TDirectives> {

    private _value?: FieldOptionsValue<TAlias, TDirectives>;

    constructor(
        private _prev?: FieldOptionsImpl<string, any>, 
        private _alias?: string, 
        private _directive?: string,
        private _directiveArgs?: object
    ) {
    }

    alias<XAlias extends string>(alias: XAlias): FieldOptions<XAlias, TDirectives> {
        return new FieldOptionsImpl<XAlias, TDirectives>(this, alias);
    }

    directive<
        XDirective extends string, 
        XArgs extends DirectiveArgs = {}
    >(
        directive: XDirective, 
        args?: XArgs
    ): FieldOptions<
        TAlias, 
        TDirectives & { readonly [key in XDirective]: XArgs}
    > {
        if (directive.startsWith("@")) {
            throw new Error("directive name should not start with '@' because it will be prepended by this framework automatcially"); 
        }
        return new FieldOptionsImpl<TAlias, TDirectives & { readonly [key in XDirective]: XArgs}>(this, undefined, directive, args);
    }

    get value(): FieldOptionsValue<TAlias, TDirectives> {
        let v = this._value;
        if (v === undefined) {
            this._value = v = this.createValue() as FieldOptionsValue<TAlias, TDirectives>;
        }
        return v;
    }

    private createValue(): FieldOptionsValue<string, { readonly [key: string]: DirectiveArgs }> {
        let alias: string | undefined = undefined;
        const directiveMap = new Map<string, object | undefined>();
        for (let options: FieldOptionsImpl<string, any> | undefined = this; options !== undefined; options = options._prev) {
            if (options._alias !== undefined && alias === undefined) {
                alias = options._alias;
            }
            const args = options._directiveArgs;
            if (options._directive !== undefined && !directiveMap.has(options._directive)) {
                directiveMap.set(options._directive, args !== undefined && Object.keys(args).length !== 0 ? args : undefined);
            }
        }
        const directives = {};
        for (const [name, args] of directiveMap) {
            directives[name] = args;
        }
        return { alias, directives };
    }
}

export interface FieldOptionsValue<TAlias extends string, TDirectives extends {readonly [key: string]: DirectiveArgs}> {
    readonly alias?: TAlias;
    readonly directives: TDirectives;
}

export function createFieldOptions<TAlias extends string>(): FieldOptions<TAlias, {}> {
    return new FieldOptionsImpl<TAlias, {}>();
}