import { WriteStream } from "fs";
import { GraphQLEnumType, GraphQLField, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLList, GraphQLNamedType, GraphQLNonNull, GraphQLObjectType, GraphQLScalarType, GraphQLType, GraphQLUnionType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { typeLocation } from "./TypeLocation";

export abstract class Writer {

    private scopes: Scope[] = [];

    private indent: string;

    private needIndent = false;

    private importedTypes = new Set<GraphQLNamedType>();

    private imported = false;
    
    constructor(
        private stream: WriteStream,
        protected config: GeneratorConfig,
    ) {
        this.indent = this.config.indent ?? "\t";
    }

    write() {
        this.importTypes();
        for (const importedType of this.importedTypes) {
            const [dir, fileName] = typeLocation(importedType, this.config);
        }
        this.imported = true;
        this.writeCode();
    }

    protected abstract importTypes();

    protected abstract writeCode();

    protected importField(field: GraphQLField<unknown, unknown>) {
        this.importType(field.type);
        for (const arg of field.args) {
            this.importType(arg.type);
        }
    }

    protected importType(type: GraphQLType) {
        if (this.imported) {
            throw new Error("Writer's importing has been terminated");
        }
    }

    protected enter(type: ScopeType, multiLines: boolean = false) {
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

    protected leave() {
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

    protected separator(value?: string) {
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

    protected typeRef(
        type: GraphQLType,
        overrideObjectTypeName?: string
    ) {
        if (type instanceof GraphQLScalarType) {
            const mappedTypeName = SCALAR_MAP[type.name];
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
                this.enter("NONE");
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
                this.typeRef(type.ofType, overrideObjectTypeName);
                this.text("[]");
            } else {
                this.text("Array<");
                this.typeRef(type.ofType, overrideObjectTypeName);
                this.text(" | undefined>");
            }
        }
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

export type ScopeType = "NONE" | "BLOCK" | "PARAMETERS";

interface Scope {
    readonly type: ScopeType;
    readonly multiLines: boolean;
    dirty: boolean;
}

const GLOBAL_SCOPE: Scope = {
    type: "NONE",
    multiLines: true,
    dirty: true
}

const SCALAR_MAP: {[key: string]: "string" | "number" | "boolean"} = {
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