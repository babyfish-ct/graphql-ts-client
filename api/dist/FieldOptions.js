"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFieldOptions = exports.fieldOptions = void 0;
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
        const directiveMap = new Map();
        for (let options = this; options !== undefined; options = options._prev) {
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
exports.fieldOptions = new FieldOptionsImpl();
function isFieldOptions(options) {
    return options instanceof FieldOptionsImpl;
}
exports.isFieldOptions = isFieldOptions;
