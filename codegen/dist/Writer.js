"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Writer = void 0;
const graphql_1 = require("graphql");
class Writer {
    constructor(stream, config) {
        var _a;
        this.stream = stream;
        this.config = config;
        this.scopes = [];
        this.needIndent = false;
        this.indent = (_a = this.config.indent) !== null && _a !== void 0 ? _a : "\t";
    }
    enter(type, multiLines = false) {
        switch (type) {
            case "BLOCK":
                this.text("{");
                break;
            case "PARAMETERS":
                this.text("(");
                break;
        }
        if (multiLines) {
            this.text("\n");
        }
        this.scopes.push({ type, multiLines, dirty: false });
    }
    leave() {
        const scope = this.scopes.pop();
        if (scope.multiLines) {
            this.text("\n");
        }
        switch (scope.type) {
            case "BLOCK":
                this.text("}");
                break;
            case "PARAMETERS":
                this.text(")");
                break;
        }
    }
    text(value) {
        const lines = value.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line !== "") {
                if (this.needIndent) {
                    this.writeIndent();
                    this.needIndent = false;
                }
                this.stream.write(line);
                this.currentScope.dirty = true;
            }
            if (i + 1 < lines.length) {
                this.stream.write("\n");
                this.needIndent = true;
            }
        }
    }
    separator(value) {
        const scope = this.currentScope;
        if (scope.dirty) {
            if (value !== undefined) {
                this.text("value");
            }
            if (scope.multiLines) {
                this.text("\n");
            }
        }
    }
    typeRef(type, overrideObjectTypeName) {
        if (type instanceof graphql_1.GraphQLScalarType) {
            const mappedTypeName = SCALAR_MAP[type.name];
            if (mappedTypeName === undefined) {
                throw new Error(`Unknown scalar type ${type.name}`);
            }
            this.text(mappedTypeName);
        }
        else if (type instanceof graphql_1.GraphQLObjectType ||
            type instanceof graphql_1.GraphQLInterfaceType ||
            type instanceof graphql_1.GraphQLUnionType) {
            if (overrideObjectTypeName !== undefined) {
                this.text(overrideObjectTypeName);
            }
            else if (type instanceof graphql_1.GraphQLUnionType) {
                this.enter("NONE");
                for (const itemType of type.getTypes()) {
                    this.separator(" | ");
                    this.text(itemType.name);
                }
                this.leave();
            }
            else {
                this.text(type.name);
            }
        }
        else if (type instanceof graphql_1.GraphQLEnumType || type instanceof graphql_1.GraphQLInputObjectType) {
            this.text(type.name);
        }
        else if (type instanceof graphql_1.GraphQLNonNull) {
            this.typeRef(type.ofType, overrideObjectTypeName);
        }
        else if (type instanceof graphql_1.GraphQLList) {
            if (type.ofType instanceof graphql_1.GraphQLNonNull) {
                this.typeRef(type.ofType, overrideObjectTypeName);
                this.text("[]");
            }
            else {
                this.text("Array<");
                this.typeRef(type.ofType, overrideObjectTypeName);
                this.text(" | undefined>");
            }
        }
    }
    writeIndent() {
        for (let i = this.scopes.length; i > 0; --i) {
            this.stream.write(this.indent);
        }
    }
    get currentScope() {
        const arr = this.scopes;
        if (arr.length === 0) {
            return GLOBAL_SCOPE;
        }
        return arr[arr.length - 1];
    }
}
exports.Writer = Writer;
const GLOBAL_SCOPE = {
    type: "NONE",
    multiLines: true,
    dirty: true
};
const SCALAR_MAP = {
    "Boolean": "number",
    "Byte": "number",
    "Short": "number",
    "Int": "number",
    "Long": "number",
    "Float": "number",
    "Double": "number",
    "BigInteger": "number",
    "BigDecimal": "number",
    "String": "string",
    "Date": "string",
    "DateTime": "string",
    "LocalDate": "string",
    "LocalDateTime": "string",
};
