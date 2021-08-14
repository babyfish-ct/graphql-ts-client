/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { WriteStream } from "fs";
import { GraphQLEnumType, GraphQLField, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLList, GraphQLNamedType, GraphQLNonNull, GraphQLObjectType, GraphQLScalarType, GraphQLType, GraphQLUnionType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";

export abstract class Writer {

    private scopes: Scope[] = [];

    private indent: string;

    private needIndent = false;

    private importStatements = new Set<string>();

    private importedTypes = new Set<GraphQLNamedType>();

    private imported = false;
    
    constructor(
        private stream: WriteStream,
        protected config: GeneratorConfig,
    ) {
        this.indent = this.config.indent ?? "\t";
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
            } else {
                let subDir: string;
                if (importedType instanceof GraphQLInputObjectType) {
                    subDir = "inputs"; 
                } else if (importedType instanceof GraphQLEnumType) {
                    subDir = "enums"; 
                } else {
                    subDir = "fetchers";
                }
                if (this.isUnderGlobalDir()) {
                    this.stream.write(`import {${importedType.name}} from './${subDir}';\n`);    
                } else {
                    this.stream.write(`import {${importedType.name}} from '../${subDir}';\n`);
                }
            }
        }
        if (this.importStatements.size !== 0 || this.importedTypes.size !== 0) {
            this.stream.write("\n");
        }
        this.writeCode();
    }

    protected prepareImportings() {}

    protected abstract writeCode();

    protected importFieldTypes(field: GraphQLField<unknown, unknown>) {
        this.importType(field.type);
        for (const arg of field.args) {
            this.importType(arg.type);
        }
    }

    protected importType(type: GraphQLType) {
        if (this.imported) {
            throw new Error("Writer's importing has been terminated");
        }
        if (type instanceof GraphQLNonNull) {
            this.importType(type.ofType);
        } else if (type instanceof GraphQLList) {
            this.importType(type.ofType);
        } else if (type instanceof GraphQLInputObjectType) {
            this.importedTypes.add(type);
        } else if (type instanceof GraphQLEnumType) {
            this.importedTypes.add(type);
        }
    }

    protected importStatement(statement: string) {
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

    protected importingBehavior(type: GraphQLNamedType): ImportingBehavior {
        return "OTHER_DIR";
    }

    protected enter(type: ScopeType, multiLines: boolean = false, prefix?: string) {
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

    protected leave(suffix?: string) {
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

    protected scope(args: ScopeArgs, scopeAction: () => void) {
        this.enter(args.type, args.multiLines === true, args.prefix);
        scopeAction();
        this.leave(args.suffix);
    }

    protected text(value: string) {
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

    protected str(value: string) {
        this.text("'");
        this.text(value);
        this.text("'");
    }

    protected separator(value?: string) {
        const scope = this.currentScope;
        if (scope.dirty) {
            if (value !== undefined) {
                this.text(value);
            } else if (scope.type === 'PARAMETERS' || scope.type === 'GENERIC') {
                this.text(", ");
            }
            if (scope.multiLines) {
                this.text("\n");
            }
        }
    }

    protected varableDecl(name: string, type: GraphQLType, overrideObjectTypeName?: string) {
        this.text(name);
        if (!(type instanceof GraphQLNonNull)) {
            this.text("?");
        }
        this.text(": ");
        this.typeRef(type, overrideObjectTypeName);
    }

    protected typeRef(
        type: GraphQLType,
        overrideObjectTypeName?: string
    ) {
        if (type instanceof GraphQLScalarType) {
            const mappedTypeName = 
                (this.config.scalarTypeMap ?? EMPTY_MAP)[type.name] 
                ?? SCALAR_MAP[type.name];
            if (mappedTypeName === undefined) {
                throw new Error(`Unknown scalar type ${type.name}`);
            }
            this.text(mappedTypeName);
        } else if (type instanceof GraphQLObjectType || 
            type instanceof GraphQLInterfaceType ||
            type instanceof GraphQLUnionType
        ) {
            if (overrideObjectTypeName !== undefined) {
                this.text(overrideObjectTypeName);
            } else if (type instanceof GraphQLUnionType) {
                this.enter("BLANK");
                for (const itemType of type.getTypes()) {
                    this.separator(" | ");
                    this.text(itemType.name);    
                }
                this.leave();
            } else {
                this.text(type.name);
            }
        } else if (type instanceof GraphQLEnumType || type instanceof GraphQLInputObjectType) {
            this.text(type.name);
        } else if (type instanceof GraphQLNonNull) {
            this.typeRef(type.ofType, overrideObjectTypeName);
        } else if (type instanceof GraphQLList) {
            if (type.ofType instanceof GraphQLNonNull) {
                if (!this.config.arrayEditable) {
                    this.text("readonly ");
                }
                this.typeRef(type.ofType, overrideObjectTypeName);
                this.text("[]");
            } else {
                if (!this.config.arrayEditable) {
                    this.text("Readonly");
                }
                this.text("Array<");
                this.typeRef(type.ofType, overrideObjectTypeName);
                this.text(" | undefined>");
            }
        }
    }

    protected gqlTypeRef(type: GraphQLType) {
        if (type instanceof GraphQLNonNull) {
            this.gqlTypeRef(type.ofType);
            this.text("!");
        } else if (type instanceof GraphQLList) {
            this.text("[");
            this.gqlTypeRef(type.ofType);
            this.text("]");
        } else if (type instanceof GraphQLUnionType) {
            this.enter("BLANK");
            for (const itemType of type.getTypes()) {
                this.separator(" | ");
                this.text(itemType.name);
            }
            this.leave();
        } else {
            this.text(type.name);
        }
    }

    protected isUnderGlobalDir(): boolean {
        return false;
    }

    private writeIndent() {
        for (let i = this.scopes.length; i > 0; --i) {
            this.stream.write(this.indent);
        }
    }

    private get currentScope(): Scope {
        const arr = this.scopes;
        if (arr.length === 0) {
            return GLOBAL_SCOPE;
        }
        return arr[arr.length - 1];
    }
}

export type ScopeType = "BLANK" | "BLOCK" | "PARAMETERS" | "ARRAY" | "GENERIC";

export type ImportingBehavior = "SELF" | "SAME_DIR" | "OTHER_DIR";

export interface ScopeArgs {
    readonly type: ScopeType;
    readonly multiLines?: boolean;
    readonly prefix?: string;
    readonly suffix?: string;
}

interface Scope {
    readonly type: ScopeType;
    readonly multiLines: boolean;
    dirty: boolean;
}

const GLOBAL_SCOPE: Scope = {
    type: "BLANK",
    multiLines: true,
    dirty: true
}

const SCALAR_MAP: {[key: string]: "string" | "number" | "boolean"} = {
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
    "ID": "number",
    "UUID": "string"
};

const EMPTY_MAP = {};