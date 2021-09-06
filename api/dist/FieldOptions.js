"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFieldOptions = void 0;
class FieldOptionsImpl {
    constructor(_prev, _alias, _directive, _directiveArgs) {
        this._prev = _prev;
        this._alias = _alias;
        this._directive = _directive;
        this._directiveArgs = _directiveArgs;
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
        for (let options = this; options !== undefined; options = options._prev) {
            if (options._alias !== undefined && alias === undefined) {
                alias = options._alias;
            }
            if (options._directive !== undefined && !directives.has(options._directive)) {
                const args = options._directiveArgs;
                directives.set(options._directive, args !== undefined && Object.keys(args).length !== 0 ? args : undefined);
            }
        }
        return { alias, directives };
    }
}
function createFieldOptions() {
    return new FieldOptionsImpl();
}
exports.createFieldOptions = createFieldOptions;
