"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLStateFetcherWriter = void 0;
const graphql_1 = require("graphql");
const FetcherWriter_1 = require("../FetcherWriter");
const Utils_1 = require("../Utils");
class GraphQLStateFetcherWriter extends FetcherWriter_1.FetcherWriter {
    importedNamesForSuperType(superType) {
        return [
            ...super.importedNamesForSuperType(superType),
            `${superType.name}ScalarType`,
            `${superType.name}FlatType`
        ];
    }
    writeCode() {
        super.writeCode();
        if (this.ctx.entityTypes.has(this.modelType)) {
            this.writeScalarType();
            this.writeFlatType();
        }
    }
    writeScalarType() {
        const t = this.text.bind(this);
        t(`\nexport interface ${this.modelType.name}ScalarType`);
        const superTypes = this.ctx.inheritanceInfo.upcastTypeMap.get(this.modelType);
        if (superTypes !== undefined && superTypes.size !== 0) {
            t(' extends ');
            this.scope({ type: "BLANK" }, () => {
                for (const superType of superTypes) {
                    this.separator(", ");
                    t(`${superType.name}ScalarType`);
                }
            });
        }
        this.scope({ type: "BLOCK", multiLines: true, prefix: " ", suffix: "\n" }, () => {
            if (this.modelType instanceof graphql_1.GraphQLObjectType || this.modelType instanceof graphql_1.GraphQLInterfaceType) {
                const fieldMap = this.modelType.getFields();
                for (const fieldName of this.declaredFieldNames) {
                    const field = fieldMap[fieldName];
                    if (Utils_1.associatedTypeOf(field.type) === undefined) {
                        t("readonly ");
                        t(fieldName);
                        if (!(field.type instanceof graphql_1.GraphQLNonNull)) {
                            t("?");
                        }
                        t(": ");
                        this.typeRef(field.type);
                        t(";\n");
                    }
                }
            }
        });
    }
    writeFlatType() {
        const t = this.text.bind(this);
        t(`\nexport interface ${this.modelType.name}FlatType extends ${this.modelType.name}ScalarType`);
        const superTypes = this.ctx.inheritanceInfo.upcastTypeMap.get(this.modelType);
        if (superTypes !== undefined && superTypes.size !== 0) {
            for (const superType of superTypes) {
                this.separator(", ");
                t(`${superType.name}FlatType`);
            }
        }
        this.scope({ type: "BLOCK", multiLines: true, prefix: " ", suffix: "\n" }, () => {
            if (this.modelType instanceof graphql_1.GraphQLObjectType || this.modelType instanceof graphql_1.GraphQLInterfaceType) {
                const fieldMap = this.modelType.getFields();
                for (const fieldName of this.declaredFieldNames) {
                    const field = fieldMap[fieldName];
                    const assocaitionType = Utils_1.associatedTypeOf(field.type);
                    if (assocaitionType !== undefined) {
                        const idField = this.ctx.idFieldMap.get(assocaitionType);
                        if (idField !== undefined) {
                            t("readonly ");
                            t(fieldName);
                            if (!(field.type instanceof graphql_1.GraphQLNonNull)) {
                                t("?");
                            }
                            t(": ");
                            this.typeRef(field.type, (type, field) => {
                                if (type === assocaitionType) {
                                    return field.name === idField.name;
                                }
                                return true;
                            });
                        }
                        t(";\n");
                    }
                }
            }
        });
    }
}
exports.GraphQLStateFetcherWriter = GraphQLStateFetcherWriter;
