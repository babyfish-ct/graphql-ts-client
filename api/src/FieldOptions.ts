export interface FieldOptions<TAlias extends string, TDirectives extends object> {
    
    alias<XAlias extends string>(alias: XAlias): FieldOptions<XAlias, TDirectives>;

    directive<XDirective extends string, XArgs extends object = {}>(
        directive: XDirective, 
        args?: XArgs
    ): FieldOptions<
        TAlias, 
        TDirectives & { readonly [key in XDirective]: XArgs }
    >;

    readonly value: FieldOptionsValue<TAlias, TDirectives>;
}

class FieldOptionsImpl<TAlias extends string, TDirectives extends object> implements FieldOptions<TAlias, TDirectives> {

    private _value?: FieldOptionsValue<TAlias, TDirectives>;

    constructor(
        private _prev?: FieldOptionsImpl<string, object>, 
        private _alias?: string, 
        private _directive?: string,
        private _directiveArgs?: object
    ) {
    }

    alias<XAlias extends string>(alias: XAlias): FieldOptions<XAlias, TDirectives> {
        return new FieldOptionsImpl<XAlias, TDirectives>(this, alias);
    }

    directive<XDirective extends string, XArgs extends object = {}>(
        directive: XDirective, 
        args?: object
    ): FieldOptions<
        TAlias, 
        TDirectives & { readonly [key in XDirective]: XArgs}
    > {
        return new FieldOptionsImpl<TAlias, TDirectives & { readonly [key in XDirective]: XArgs}>(this, undefined, directive, args);
    }

    get value(): FieldOptionsValue<TAlias, TDirectives> {
        let v = this._value;
        if (v === undefined) {
            this._value = v = this.createValue() as FieldOptionsValue<TAlias, TDirectives>;
        }
        return v;
    }

    private createValue(): FieldOptionsValue<string, object> {
        let alias: string | undefined = undefined;
        const directiveMap = new Map<string, object | undefined>();
        for (let options: FieldOptionsImpl<string, object> | undefined = this; options !== undefined; options = options._prev) {
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

export interface FieldOptionsValue<TAlias extends string, TDirectives extends object> {
    readonly alias?: TAlias;
    readonly directives: TDirectives;
}

export const fieldOptions: FieldOptions<"", {}> = new FieldOptionsImpl<"", {}>();

export function isFieldOptions(options: any): boolean {
    return options instanceof FieldOptionsImpl;
}
