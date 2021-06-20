"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Writer = void 0;
const graphql_1 = require("graphql");
const FetcherWriter_1 = require("./FetcherWriter");
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
        this.indent = (_a = this.config.indent) !== null && _a !== void 0 ? _a : "\t";
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
            const importedName = importedType instanceof graphql_1.GraphQLObjectType ||
                importedType instanceof graphql_1.GraphQLInterfaceType ?
                FetcherWriter_1.generatedFetcherTypeName(importedType, this.config) :
                importedType.name;
            if (behavior === 'SAME_DIR') {
                this.stream.write(`import {${importedName}} from '.';\n`);
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
                this.stream.write(`import {${importedName}} from '../${subDir}';\n`);
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
        else if (type instanceof graphql_1.GraphQLUnionType) {
            for (const itemType of type.getTypes()) {
                this.importedTypes.add(itemType);
            }
        }
        else if (type instanceof graphql_1.GraphQLObjectType) {
            this.importedTypes.add(type);
        }
        else if (type instanceof graphql_1.GraphQLInterfaceType) {
            this.importedTypes.add(type);
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
        }
        if (multiLines) {
            this.text("\n");
        }
        this.scopes.push({ type, multiLines, dirty: false });
    }
    leave(suffix) {
        const scope = this.scopes.pop();
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
        }
        if (suffix !== undefined) {
            this.text(suffix);
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
                this.text(value);
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
    "UUID": "string"
};
