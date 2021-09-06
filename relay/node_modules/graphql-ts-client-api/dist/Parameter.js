"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterRef = void 0;
/**
 * 1. If object is used by field arguments, don't specify the graphqlTypeName
 * 2. If object is used by directive arguments, graphqlTypeName is required
 */
class ParameterRef {
    constructor(name, graphqlTypeName) {
        this.name = name;
        this.graphqlTypeName = graphqlTypeName;
        if (name.startsWith("$")) {
            throw new Error("parameter name cannot start with '$'");
        }
    }
    static of(name, graphqlTypeName) {
        return new ParameterRef(name, graphqlTypeName);
    }
}
exports.ParameterRef = ParameterRef;
