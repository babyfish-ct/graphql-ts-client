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
        this.importedScalarTypes = new Map();
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
                this.stream.write(`import type {${importedType.name}} from '.';\n`);
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
                    this.stream.write(`import type {${importedType.name}} from './${subDir}';\n`);
                }
                else {
                    this.stream.write(`import type {${importedType.name}} from '../${subDir}';\n`);
                }
            }
        }
        if (this.importedScalarTypes.size !== 0) {
            const sourcePrefix = this.isUnderGlobalDir() ? "../" : "../../";
            for (const [importSource, typeNames] of this.importedScalarTypes) {
                this.stream.write(`import type { ${Array.from(typeNames).join(", ")} } from '${sourcePrefix}${importSource}';\n`);
            }
        }
        if (this.importStatements.size !== 0 || this.importedTypes.size !== 0 || this.importedScalarTypes.size !== 0) {
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
        else if (type instanceof graphql_1.GraphQLScalarType && this.config.scalarTypeMap !== undefined) {
            const mappedType = this.config.scalarTypeMap[type.name];
            if (typeof mappedType == 'object') {
                const importSource = mappedType.importSource;
                let set = this.importedScalarTypes.get(importSource);
                if (set === undefined) {
                    set = new Set();
                    this.importedScalarTypes.set(importSource, set);
                }
                set.add(mappedType.typeName);
            }
            ;
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
    typeRef(type, objectRender) {
        var _a, _b;
        if (type instanceof graphql_1.GraphQLScalarType) {
            const mappedType = (_b = ((_a = this.config.scalarTypeMap) !== null && _a !== void 0 ? _a : EMPTY_MAP)[type.name]) !== null && _b !== void 0 ? _b : SCALAR_MAP[type.name];
            if (mappedType === undefined) {
                throw new Error(`Unknown scalar type ${type.name}`);
            }
            if (typeof mappedType === 'string') {
                this.text(mappedType);
            }
            else {
                this.text(mappedType.typeName);
            }
        }
        else if (type instanceof graphql_1.GraphQLObjectType ||
            type instanceof graphql_1.GraphQLInterfaceType ||
            type instanceof graphql_1.GraphQLUnionType) {
            if (typeof objectRender === "string") {
                this.text(objectRender);
            }
            else if (type instanceof graphql_1.GraphQLUnionType) {
                this.enter("BLANK");
                for (const itemType of type.getTypes()) {
                    this.separator(" | ");
                    this.text(itemType.name);
                }
                this.leave();
            }
            else if (typeof objectRender === 'function') {
                this.scope({ type: "BLOCK", multiLines: true }, () => {
                    const fieldMap = type.getFields();
                    for (const fieldName in fieldMap) {
                        const field = fieldMap[fieldName];
                        if (objectRender(type, field)) {
                            this.separator(", ");
                            this.text("readonly ");
                            this.text(fieldName);
                            this.text(": ");
                            this.typeRef(field.type, objectRender);
                        }
                    }
                });
            }
            else {
                this.text(type.name);
            }
        }
        else if (type instanceof graphql_1.GraphQLEnumType || type instanceof graphql_1.GraphQLInputObjectType) {
            this.text(type.name);
        }
        else if (type instanceof graphql_1.GraphQLNonNull) {
            this.typeRef(type.ofType, objectRender);
        }
        else if (type instanceof graphql_1.GraphQLList) {
            if (!this.config.arrayEditable) {
                this.text("Readonly");
            }
            this.text("Array<");
            this.typeRef(type.ofType, objectRender);
            if (!(type.ofType instanceof graphql_1.GraphQLNonNull)) {
                this.text(" | undefined");
            }
            this.text(">");
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
