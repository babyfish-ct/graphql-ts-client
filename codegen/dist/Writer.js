"use strict";
/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
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
        this.importStatements = new Set();
        this.importedTypes = new Set();
        this.imported = false;
        this.indent = (_a = this.config.indent) !== null && _a !== void 0 ? _a : "    ";
    }
    write() {
        this.prepareImportings();
        this.imported = true;
        for (const importStatement of this.importStatements) {
            this.stream.write(importStatement);
            this.stream.write("\n");
        }
        for (const importedType of this.importedTypes) {
            const behavior = this.importingBehavior(importedType);
            if (behavior === 'SELF') {
                continue;
            }
            if (behavior === 'SAME_DIR') {
                this.stream.write(`import {${importedType.name}} from '.';\n`);
            }
            else {
                let subDir;
                if (importedType instanceof graphql_1.GraphQLInputObjectType) {
                    subDir = "inputs";
                }
                else if (importedType instanceof graphql_1.GraphQLEnumType) {
                    subDir = "enums";
                }
                else {
                    subDir = "fetchers";
                }
                if (this.isUnderGlobalDir()) {
                    this.stream.write(`import {${importedType.name}} from './${subDir}';\n`);
                }
                else {
                    this.stream.write(`import {${importedType.name}} from '../${subDir}';\n`);
                }
            }
        }
        if (this.importStatements.size !== 0 || this.importedTypes.size !== 0) {
            this.stream.write("\n");
        }
        this.writeCode();
    }
    prepareImportings() { }
    importFieldTypes(field) {
        this.importType(field.type);
        for (const arg of field.args) {
            this.importType(arg.type);
        }
    }
    importType(type) {
        if (this.imported) {
            throw new Error("Writer's importing has been terminated");
        }
        if (type instanceof graphql_1.GraphQLNonNull) {
            this.importType(type.ofType);
        }
        else if (type instanceof graphql_1.GraphQLList) {
            this.importType(type.ofType);
        }
        else if (type instanceof graphql_1.GraphQLInputObjectType) {
            this.importedTypes.add(type);
        }
        else if (type instanceof graphql_1.GraphQLEnumType) {
            this.importedTypes.add(type);
        }
    }
    importStatement(statement) {
        if (this.imported) {
            throw new Error("Writer's importing has been terminated");
        }
        let stmt = statement;
        if (stmt.endsWith("\n")) {
            stmt = stmt.substring(0, stmt.length - 1);
        }
        if (!stmt.endsWith(";")) {
            stmt += ";";
        }
        this.importStatements.add(stmt);
    }
    importingBehavior(type) {
        return "OTHER_DIR";
    }
    enter(type, multiLines = false, prefix) {
        if (prefix !== undefined) {
            this.text(prefix);
        }
        switch (type) {
            case "BLOCK":
                this.text("{");
                break;
            case "PARAMETERS":
                this.text("(");
                break;
            case "ARRAY":
                this.text("[");
                break;
            case "GENERIC":
                this.text("<");
                break;
        }
        if (multiLines) {
            this.text("\n");
        }
        this.scopes.push({ type, multiLines, dirty: false });
    }
    leave(suffix) {
        const scope = this.scopes.pop();
        if (scope === undefined) {
            throw new Error("Illegal state");
        }
        if (scope.multiLines && !this.needIndent) {
            this.text("\n");
        }
        switch (scope.type) {
            case "BLOCK":
                this.text("}");
                break;
            case "PARAMETERS":
                this.text(")");
                break;
            case "ARRAY":
                this.text("]");
                break;
            case "GENERIC":
                this.text(">");
                break;
        }
        if (suffix !== undefined) {
            this.text(suffix);
        }
    }
    scope(args, scopeAction) {
        this.enter(args.type, args.multiLines === true, args.prefix);
        scopeAction();
        this.leave(args.suffix);
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
    str(value) {
        this.text("'");
        this.text(value);
        this.text("'");
    }
    separator(value) {
        const scope = this.currentScope;
        if (scope.dirty) {
            if (value !== undefined) {
                this.text(value);
            }
            else if (scope.type === 'PARAMETERS' || scope.type === 'GENERIC') {
                this.text(", ");
            }
            if (scope.multiLines) {
                this.text("\n");
            }
        }
    }
    varableDecl(name, type, overrideObjectTypeName) {
        this.text(name);
        if (!(type instanceof graphql_1.GraphQLNonNull)) {
            this.text("?");
        }
        this.text(": ");
        this.typeRef(type, overrideObjectTypeName);
    }
    typeRef(type, overrideObjectTypeName) {
        var _a, _b;
        if (type instanceof graphql_1.GraphQLScalarType) {
            const mappedTypeName = (_b = ((_a = this.config.scalarTypeMap) !== null && _a !== void 0 ? _a : EMPTY_MAP)[type.name]) !== null && _b !== void 0 ? _b : SCALAR_MAP[type.name];
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
                this.enter("BLANK");
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
                if (!this.config.arrayEditable) {
                    this.text("readonly ");
                }
                this.typeRef(type.ofType, overrideObjectTypeName);
                this.text("[]");
            }
            else {
                if (!this.config.arrayEditable) {
                    this.text("Readonly");
                }
                this.text("Array<");
                this.typeRef(type.ofType, overrideObjectTypeName);
                this.text(" | undefined>");
            }
        }
    }
    gqlTypeRef(type) {
        if (type instanceof graphql_1.GraphQLNonNull) {
            this.gqlTypeRef(type.ofType);
            this.text("!");
        }
        else if (type instanceof graphql_1.GraphQLList) {
            this.text("[");
            this.gqlTypeRef(type.ofType);
            this.text("]");
        }
        else if (type instanceof graphql_1.GraphQLUnionType) {
            this.enter("BLANK");
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
    isUnderGlobalDir() {
        return false;
    }
    writeIndent() {
        for (const scope of this.scopes) {
            if (scope.multiLines) {
                this.stream.write(this.indent);
            }
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
    type: "BLANK",
    multiLines: true,
    dirty: true
};
const SCALAR_MAP = {
    "Boolean": "boolean",
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
    "ID": "string",
    "UUID": "string"
};
const EMPTY_MAP = {};
