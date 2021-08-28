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

    invisibleDirective<
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
        private _directiveArgs?: object,
        private _invisibleDirective?: string,
        private _invisibleDirectiveArgs?: object
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

    invisibleDirective<
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
        return new FieldOptionsImpl<TAlias, TDirectives & { readonly [key in XDirective]: XArgs}>(this, undefined, undefined, undefined, directive, args);
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
        const directives = {};
        const invisibleDirectives = {};
        for (let options: FieldOptionsImpl<string, any> | undefined = this; options !== undefined; options = options._prev) {
            if (options._alias !== undefined && alias === undefined) {
                alias = options._alias;
            }
            if (options._directive !== undefined && !directives[options._directive] === undefined) {
                const args = options._directiveArgs;
                directives[options._directive] = args !== undefined && Object.keys(args).length !== 0 ? args : undefined;
            }
            if (options._invisibleDirective !== undefined && invisibleDirectives[options._invisibleDirective] === undefined) {
                if (directives[options._invisibleDirective] !== undefined) {
                    throw new Error(`'${options._invisibleDirective}' is used both directive and invisible directive`);
                }
                const args = options._invisibleDirectiveArgs;
                invisibleDirectives[options._invisibleDirective] = args !== undefined && Object.keys(args).length !== 0 ? args : undefined;
            }
        }
        return { alias, directives, invisibleDirectives };
    }
}

export interface FieldOptionsValue<TAlias extends string, TDirectives extends {readonly [key: string]: DirectiveArgs}> {
    readonly alias?: TAlias;
    readonly directives: TDirectives;
    readonly invisibleDirectives?: TDirectives;
}

export function createFieldOptions<TAlias extends string>(): FieldOptions<TAlias, {}> {
    return new FieldOptionsImpl<TAlias, {}>();
}