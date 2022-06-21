"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumInputMetadataWriter = void 0;
const graphql_1 = require("graphql");
const Writer_1 = require("./Writer");
class EnumInputMetadataWriter extends Writer_1.Writer {
    constructor(schema, stream, config) {
        super(stream, config);
        this.schema = schema;
    }
    prepareImportings() {
        this.importStatement("import { EnumInputMetadataBuilder } from 'graphql-ts-client-api';");
    }
    writeCode() {
        const enumInputMetaTypeMap = new Map();
        const typeMap = this.schema.getTypeMap();
        for (const typeName in typeMap) {
            const type = typeMap[typeName];
            if (type instanceof graphql_1.GraphQLEnumType) {
                this.collectEnumMetaTypes(type, enumInputMetaTypeMap);
            }
            else if (type instanceof graphql_1.GraphQLInputObjectType) {
                this.collectEnumMetaTypes(type, enumInputMetaTypeMap);
            }
        }
        this.text("export const ENUM_INPUT_METADATA = ");
        this.scope({ type: "BLANK", multiLines: true }, () => {
            this.text("new EnumInputMetadataBuilder()\n");
            for (const [typeName, fields] of enumInputMetaTypeMap) {
                this.text('.add("');
                this.text(typeName);
                this.text('"');
                if (fields !== undefined) {
                    this.text(", ");
                    this.scope({ type: "ARRAY", multiLines: true }, () => {
                        for (const field of fields) {
                            this.separator(", ");
                            this.scope({ type: "BLOCK" }, () => {
                                this.text('name: \"');
                                this.text(field.name);
                                this.text('", typeName: "');
                                this.text(EnumInputMetadataWriter.inputTypeName(field.type));
                                this.text('"');
                            });
                        }
                    });
                }
                this.text(")\n");
            }
            this.text(".build()");
        });
        this.text(";");
    }
    collectEnumMetaTypes(type, outMap) {
        if (type instanceof graphql_1.GraphQLScalarType) {
            return false;
        }
        if (type instanceof graphql_1.GraphQLList) {
            return this.collectEnumMetaTypes(type.ofType, outMap);
        }
        if (type instanceof graphql_1.GraphQLNonNull) {
            return this.collectEnumMetaTypes(type.ofType, outMap);
        }
        if (type.name.startsWith("__")) {
            return false;
        }
        if (outMap.has(type.name)) {
            return true;
        }
        if (type instanceof graphql_1.GraphQLEnumType) {
            outMap.set(type.name, undefined);
            return true;
        }
        const fieldMap = type.getFields();
        const fields = [];
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName];
            if (this.collectEnumMetaTypes(field.type, outMap)) {
                fields.push(field);
            }
        }
        if (fields.length == 0) {
            return false;
        }
        outMap.set(type.name, fields);
        return true;
    }
    static inputTypeName(type) {
        if (type instanceof graphql_1.GraphQLList) {
            return EnumInputMetadataWriter.inputTypeName(type.ofType);
        }
        if (type instanceof graphql_1.GraphQLNonNull) {
            return EnumInputMetadataWriter.inputTypeName(type.ofType);
        }
        return type.name;
    }
}
exports.EnumInputMetadataWriter = EnumInputMetadataWriter;
