import { GraphQLInterfaceType, GraphQLNonNull, GraphQLObjectType, GraphQLUnionType } from "graphql";
import { FetcherWriter } from "../FetcherWriter";
import { targetTypeOf } from "../Utils";

export class GraphQLStateFetcherWriter extends FetcherWriter {

    protected importedNamesForSuperType(superType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType): string[] {
        if (!this.ctx.triggerableTypes.has(superType)) {
            return super.importedNamesForSuperType(superType);
        }
        return [
            ...super.importedNamesForSuperType(superType),
            `${superType.name}FlatType`
        ];
    }

    protected writeCode() {
        super.writeCode();
        if (this.ctx.triggerableTypes.has(this.modelType)) {
            this.writeFlatType();
        }
    }

    private writeFlatType() {

        const t = this.text.bind(this);

        t(`\nexport interface ${this.modelType.name}FlatType`);
        
        const superTypes = this.ctx.inheritanceInfo.upcastTypeMap.get(this.modelType);
        if (superTypes !== undefined) {
            const arr = Array.from(superTypes).filter(it => this.ctx.triggerableTypes.has(it));
            if (arr.length !== 0) {
                t(' extends ');
                this.scope({type: "BLANK"}, () => {
                    for (const superType of arr) {
                        this.separator(", ");
                        t(`${superType.name}FlatType`);
                    }
                });
            }
        }

        this.scope({type: "BLOCK", multiLines: true, prefix: " ", suffix: "\n"}, () => {
            if (this.modelType instanceof GraphQLObjectType || this.modelType instanceof GraphQLInterfaceType) {
                const fieldMap = this.modelType.getFields();
                for (const fieldName of this.declaredFieldNames) {
                    const field = fieldMap[fieldName]!;
                    const category = this.fieldCategoryMap.get(fieldName);
                    const targetType = targetTypeOf(field.type);
                    if (category === "SCALAR") {
                        t("readonly ");
                        t(fieldName);
                        if (!(field.type instanceof GraphQLNonNull)) {
                            t("?");
                        }
                        t(": ");
                        this.typeRef(field.type);
                        t(";\n");
                    } else if (targetType !== undefined && category !== "SCALAR") {
                        let nodeType = this.ctx.connections.get(targetType)?.nodeType ?? targetType;
                        const idField = this.ctx.idFieldMap.get(nodeType);
                        if (idField === undefined) {
                            throw new Error(`${nodeType.name} does not has id field`);
                        }
                        t("readonly ");
                        t(fieldName);
                        if (!(field.type instanceof GraphQLNonNull)) {
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
