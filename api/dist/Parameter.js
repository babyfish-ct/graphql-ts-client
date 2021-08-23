"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterRef = void 0;
class ParameterRef {
    constructor(name) {
        this.name = name;
        if (name.startsWith("$")) {
            throw new Error("parameter name cannot start with '$'");
        }
    }
    static of(name) {
        return new ParameterRef(name);
    }
}
exports.ParameterRef = ParameterRef;
