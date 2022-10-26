import { WriteStream } from "fs";
import { GraphQLEnumType, GraphQLInputField, GraphQLInputObjectType, GraphQLInputType, GraphQLList, GraphQLNonNull, GraphQLScalarType, GraphQLSchema } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";

export class EnumInputMetadataWriter extends Writer {

    constructor(
        private schema: GraphQLSchema,
        stream: WriteStream, 
        config: GeneratorConfig
    ) {
        super(stream, config);
    }

    protected prepareImportings() {
        this.importStatement("import { EnumInputMetadataBuilder } from 'graphql-ts-client-api';");
    }

    protected writeCode() {
        const processedTypeNames = new Set<string>();
        const enumInputMetaTypeMap = new Map<string, ReadonlyArray<GraphQLInputField> | undefined>();
        const typeMap = this.schema.getTypeMap();
        for (const typeName in typeMap) {
            const type = typeMap[typeName];
            if (type instanceof GraphQLEnumType) {
                this.collectEnumMetaTypes(type, processedTypeNames, enumInputMetaTypeMap);
            } else if (type instanceof GraphQLInputObjectType) {
                this.collectEnumMetaTypes(type, processedTypeNames, enumInputMetaTypeMap);
            }
        }
        this.text("const builder = new EnumInputMetadataBuilder();\n");
        for (const [typeName, fields] of enumInputMetaTypeMap) {
            this.text('\nbuilder.add("');
            this.text(typeName);
            this.text('"');
            if (fields !== undefined) {
                this.text(", ");
                this.scope({type: "ARRAY", multiLines: true}, () => {
                    for (const field of fields) {
                        this.separator(", ");
                        this.scope({type: "BLOCK"}, () => {
                            this.text('name: \"');
                            this.text(field.name)
                            this.text('", typeName: "');
                            this.text(EnumInputMetadataWriter.inputTypeName(field.type));
                            this.text('"');
                        });
                    }
                });
            }
            this.text(");\n");
        }
        this.text("\nexport const ENUM_INPUT_METADATA = builder.build();\n");
    }

    private collectEnumMetaTypes(
        type: GraphQLInputType,
        processedTypeNames: Set<string>,
        outMap: Map<string, ReadonlyArray<GraphQLInputField> | undefined>
    ): boolean {
        
        if (type instanceof GraphQLScalarType) {
            return false;
        }
        if (type instanceof GraphQLList) {
            return this.collectEnumMetaTypes(type.ofType, processedTypeNames, outMap);
        }
        if (type instanceof GraphQLNonNull) {
            return this.collectEnumMetaTypes(type.ofType, processedTypeNames, outMap);
        }

        if (type.name.startsWith("__")) {
            return false;
        }

        if (outMap.has(type.name)) {
            return true;
        }

        if (processedTypeNames.has(type.name)) {
            return false;
        }

        if (type instanceof GraphQLEnumType) { 
            outMap.set(type.name, undefined);
            return true;
        }
        
        processedTypeNames.add(type.name);
        const fieldMap = type.getFields();
        const fields: GraphQLInputField[] = [];
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName];
            if (this.collectEnumMetaTypes(field.type, processedTypeNames, outMap)) {
                fields.push(field);
            }
        }
        if (fields.length == 0) {
            return false;
        }
        outMap.set(type.name, fields);
        return true;
    }

    private static inputTypeName(type: GraphQLInputType) {
        if (type instanceof GraphQLList) {
            return EnumInputMetadataWriter.inputTypeName(type.ofType);
        }
        if (type instanceof GraphQLNonNull) {
            return EnumInputMetadataWriter.inputTypeName(type.ofType);
        }
        return type.name;
    }
}
