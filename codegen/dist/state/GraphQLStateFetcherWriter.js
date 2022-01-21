"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLStateFetcherWriter = void 0;
const graphql_1 = require("graphql");
const FetcherWriter_1 = require("../FetcherWriter");
const Utils_1 = require("../Utils");
class GraphQLStateFetcherWriter extends FetcherWriter_1.FetcherWriter {
    importedNamesForSuperType(superType) {
        if (!this.ctx.triggerableTypes.has(superType)) {
            return super.importedNamesForSuperType(superType);
        }
        return [
            ...super.importedNamesForSuperType(superType),
            `${superType.name}FlatType`
        ];
    }
    writeCode() {
        super.writeCode();
        if (this.ctx.triggerableTypes.has(this.modelType)) {
            this.writeFlatType();
        }
    }
    writeFlatType() {
        const t = this.text.bind(this);
        t(`\nexport interface ${this.modelType.name}FlatType`);
        const superTypes = this.ctx.inheritanceInfo.upcastTypeMap.get(this.modelType);
        if (superTypes !== undefined) {
            const arr = Array.from(superTypes).filter(it => this.ctx.triggerableTypes.has(it));
            if (arr.length !== 0) {
                t(' extends ');
                this.scope({ type: "BLANK" }, () => {
                    for (const superType of arr) {
                        this.separator(", ");
                        t(`${superType.name}FlatType`);
                    }
                });
            }
        }
        this.scope({ type: "BLOCK", multiLines: true, prefix: " ", suffix: "\n" }, () => {
            var _a, _b;
            if (this.modelType instanceof graphql_1.GraphQLObjectType || this.modelType instanceof graphql_1.GraphQLInterfaceType) {
                const fieldMap = this.modelType.getFields();
                for (const fieldName of this.declaredFieldNames) {
                    const field = fieldMap[fieldName];
                    const category = this.fieldCategoryMap.get(fieldName);
                    const targetType = (0, Utils_1.targetTypeOf)(field.type);
                    if (category === "SCALAR") {
                        t("readonly ");
                        t(fieldName);
                        if (!(field.type instanceof graphql_1.GraphQLNonNull)) {
                            t("?");
                        }
                        t(": ");
                        this.typeRef(field.type);
                        t(";\n");
                    }
                    else if (targetType !== undefined && category !== "SCALAR") {
                        let nodeType = (_b = (_a = this.ctx.connections.get(targetType)) === null || _a === void 0 ? void 0 : _a.nodeType) !== null && _b !== void 0 ? _b : targetType;
                        const idField = this.ctx.idFieldMap.get(nodeType);
                        if (idField === undefined) {
                            throw new Error(`${nodeType.name} does not has id field`);
                        }
                        t("readonly ");
                        t(fieldName);
                        if (!(field.type instanceof graphql_1.GraphQLNonNull)) {
                            t("?");
                        }
                        t(": ");
                        this.typeRef(field.type, (type, field) => {
                            if (type === nodeType) {
                                return field.name === idField.name;
                            }
                            return true;
                        });
                        t(";\n");
                    }
                }
            }
        });
    }
}
exports.GraphQLStateFetcherWriter = GraphQLStateFetcherWriter;
