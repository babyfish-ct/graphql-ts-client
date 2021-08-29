"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFieldOptions = void 0;
class FieldOptionsImpl {
    constructor(_prev, _alias, _directive, _directiveArgs, _invisibleDirective, _invisibleDirectiveArgs) {
        this._prev = _prev;
        this._alias = _alias;
        this._directive = _directive;
        this._directiveArgs = _directiveArgs;
        this._invisibleDirective = _invisibleDirective;
        this._invisibleDirectiveArgs = _invisibleDirectiveArgs;
    }
    alias(alias) {
        return new FieldOptionsImpl(this, alias);
    }
    directive(directive, args) {
        if (directive.startsWith("@")) {
            throw new Error("directive name should not start with '@' because it will be prepended by this framework automatcially");
        }
        return new FieldOptionsImpl(this, undefined, directive, args);
    }
    invisibleDirective(directive, args) {
        if (directive.startsWith("@")) {
            throw new Error("directive name should not start with '@' because it will be prepended by this framework automatcially");
        }
        return new FieldOptionsImpl(this, undefined, undefined, undefined, directive, args);
    }
    get value() {
        let v = this._value;
        if (v === undefined) {
            this._value = v = this.createValue();
        }
        return v;
    }
    createValue() {
        let alias = undefined;
        const directives = new Map();
        const invisibleDirectives = new Map();
        for (let options = this; options !== undefined; options = options._prev) {
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
function createFieldOptions() {
    return new FieldOptionsImpl();
}
exports.createFieldOptions = createFieldOptions;
