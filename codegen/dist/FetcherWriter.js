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
exports.generatedFetcherTypeName = exports.FetcherWriter = void 0;
const graphql_1 = require("graphql");
const Associations_1 = require("./Associations");
const Writer_1 = require("./Writer");
class FetcherWriter extends Writer_1.Writer {
    constructor(modelType, inheritanceInfo, stream, config) {
        var _a;
        super(stream, config);
        this.modelType = modelType;
        this.inheritanceInfo = inheritanceInfo;
        this.fetcherTypeName = generatedFetcherTypeName(modelType, config);
        if (modelType instanceof graphql_1.GraphQLUnionType) {
            const map = {};
            const itemCount = modelType.getTypes().length;
            if (itemCount !== 0) {
                const fieldCountMap = new Map();
                for (const type of modelType.getTypes()) {
                    for (const fieldName in type.getFields()) {
                        fieldCountMap.set(fieldName, ((_a = fieldCountMap.get(fieldName)) !== null && _a !== void 0 ? _a : 0) + 1);
                    }
                }
                const firstTypeFieldMap = modelType.getTypes()[0].getFields();
                for (const fieldName in firstTypeFieldMap) {
                    if (fieldCountMap.get(fieldName) === itemCount) {
                        map[fieldName] = firstTypeFieldMap[fieldName];
                    }
                }
            }
            this.fieldMap = map;
        }
        else {
            this.fieldMap = modelType.getFields();
        }
        const methodNames = [];
        const defaultFetcherProps = [];
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            const associatedType = Associations_1.associatedTypeOf(field.type);
            if (associatedType !== undefined) {
                methodNames.push(fieldName);
            }
            else {
                if (config.defaultFetcherExcludeMap !== undefined) {
                    const excludeProps = config.defaultFetcherExcludeMap[modelType.name];
                    if (excludeProps !== undefined && excludeProps.filter(name => name === fieldName).length !== 0) {
                        continue;
                    }
                }
                defaultFetcherProps.push(fieldName);
            }
        }
        this.methodNames = methodNames;
        this.defaultFetcherProps = defaultFetcherProps;
        let prefix = instancePrefix(this.modelType.name);
        this.emptyFetcherName = `${prefix}$`;
        this.defaultFetcherName = defaultFetcherProps.length !== 0 ? `${prefix}$$` : undefined;
    }
    prepareImportings() {
        var _a;
        this.importStatement("import { Fetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';");
        this.importStatement("import { WithTypeName, ImplementationType } from '../CommonTypes';");
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            this.importFieldTypes(field);
        }
        const upcastTypes = this.inheritanceInfo.upcastTypeMap.get(this.modelType);
        if (upcastTypes !== undefined) {
            for (const upcastType of upcastTypes) {
                this.importStatement(`import { ${instancePrefix(upcastType.name)}$ } from './${upcastType.name}${(_a = this.config.fetcherSuffix) !== null && _a !== void 0 ? _a : "Fetcher"}';`);
            }
        }
    }
    importingBehavior(type) {
        if (type === this.modelType) {
            return "SELF";
        }
        if (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType) {
            return "SAME_DIR";
        }
        return "OTHER_DIR";
    }
    writeCode() {
        const t = this.text.bind(this);
        t(COMMENT);
        t("export interface ");
        t(this.fetcherTypeName);
        t("<T extends object> extends Fetcher<'");
        t(this.modelType.name);
        t("', T> ");
        this.enter("BLOCK", true);
        t("\n");
        t("readonly fetchedEntityType: '");
        t(this.modelType.name);
        t("';\n");
        t("\n");
        t("readonly __typename: ");
        t(this.fetcherTypeName);
        t("<T & {__typename: ImplementationType<'");
        t(this.modelType.name);
        t("'>}>;\n");
        t(`\non<XName extends ImplementationType<'${this.modelType.name}'>, X extends object>`);
        this.scope({ type: "PARAMETERS" }, () => {
            t("child: Fetcher<XName, X>");
        });
        t(`: ${this.fetcherTypeName}`);
        this.scope({ type: "GENERIC", multiLines: true }, () => {
            t(`XName extends '${this.modelType.name}' ?\n`);
            t("T & X :\n");
            t(`WithTypeName<T, ImplementationType<'${this.modelType.name}'>> & `);
            this.scope({ type: "BLANK", multiLines: true, prefix: "(", suffix: ")" }, () => {
                t("WithTypeName<X, ImplementationType<XName>>");
                this.separator(" | ");
                t(`{__typename: Exclude<ImplementationType<'${this.modelType}'>, ImplementationType<XName>>}`);
            });
        });
        t(";\n");
        if (!(this.modelType instanceof graphql_1.GraphQLUnionType)) {
            t("\nasFragment(name: string): Fetcher<");
            this.str(this.modelType.name);
            t(", T>;\n");
        }
        for (const fieldName in this.fieldMap) {
            t("\n");
            const field = this.fieldMap[fieldName];
            this.writePositiveProp(field);
            this.writeNegativeProp(field);
        }
        this.leave("\n");
        this.writeInstances();
    }
    writePositiveProp(field) {
        const t = this.text.bind(this);
        const associatedType = Associations_1.associatedTypeOf(field.type);
        if (field.args.length === 0 && associatedType === undefined) {
            t("readonly ");
            t(field.name);
        }
        else {
            const multiLines = field.args.length +
                (associatedType !== undefined ? 1 : 0)
                > 1;
            t(field.name);
            if (associatedType !== undefined) {
                t("<X extends object>");
            }
            this.enter("PARAMETERS", multiLines);
            {
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t("args: ");
                    this.enter("BLOCK", multiLines);
                    {
                        for (const arg of field.args) {
                            this.separator(", ");
                            t(arg.name);
                            if (!(arg instanceof graphql_1.GraphQLNonNull)) {
                                t("?");
                            }
                            t(": ");
                            this.typeRef(arg.type);
                        }
                    }
                    this.leave();
                }
                if (associatedType !== undefined) {
                    this.separator(", ");
                    t("child: ");
                    t("Fetcher<'");
                    t(associatedType.name);
                    t("', X>");
                }
            }
            this.leave();
        }
        t(": ");
        t(this.fetcherTypeName);
        t("<T & {");
        if (!this.config.objectEditable) {
            t("readonly ");
        }
        t(field.name);
        if (!(field.type instanceof graphql_1.GraphQLNonNull)) {
            t("?");
        }
        t(": ");
        this.typeRef(field.type, associatedType !== undefined ? "X" : undefined);
        t("}>;\n");
    }
    writeNegativeProp(field) {
        const t = this.text.bind(this);
        t('readonly "~');
        t(field.name);
        t('": ');
        t(this.fetcherTypeName);
        t("<Omit<T, '");
        t(field.name);
        t("'>>;\n");
    }
    writeInstances() {
        const t = this.text.bind(this);
        const itemTypes = this.modelType instanceof graphql_1.GraphQLUnionType ? this.modelType.getTypes() : [];
        t("\nexport const ");
        t(this.emptyFetcherName);
        t(": ");
        t(generatedFetcherTypeName(this.modelType, this.config));
        t("<{}> = ");
        this.scope({ type: "BLANK", multiLines: true, suffix: ";\n" }, () => {
            t("createFetcher");
            this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                t("createFetchableType");
                this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                    t(`"${this.modelType.name}"`);
                    this.separator(", ");
                    this.scope({ type: "ARRAY" }, () => {
                        const upcastTypes = this.inheritanceInfo.upcastTypeMap.get(this.modelType);
                        if (upcastTypes !== undefined) {
                            for (const upcastType of upcastTypes) {
                                this.separator(", ");
                                t(`${instancePrefix(upcastType.name)}$.fetchableType`);
                            }
                        }
                    });
                    this.separator(", ");
                    this.scope({ type: "ARRAY" }, () => {
                        for (const declaredFieldName of this.declaredFieldNames()) {
                            this.separator(", ");
                            t(`"${declaredFieldName}"`);
                        }
                    });
                });
                this.separator(", ");
                if (itemTypes.length === 0) {
                    t("undefined");
                }
                else {
                    this.scope({ type: "ARRAY", multiLines: itemTypes.length >= 2 }, () => {
                        for (const itemType of itemTypes) {
                            this.separator(", ");
                            this.str(itemType.name);
                        }
                    });
                }
                this.separator(", ");
                this.scope({ type: "ARRAY", multiLines: this.methodNames.length >= 2 }, () => {
                    for (const methodName of this.methodNames) {
                        this.separator(", ");
                        this.str(methodName);
                    }
                });
            });
        });
        if (this.defaultFetcherName !== undefined) {
            t("\nexport const ");
            t(this.defaultFetcherName);
            t(" = ");
            this.enter("BLANK", true);
            t(this.emptyFetcherName);
            this.enter("BLANK", true);
            for (const propName of this.defaultFetcherProps) {
                t(".");
                t(propName);
                t("\n");
            }
            this.leave();
            this.leave(";");
        }
    }
    declaredFieldNames() {
        const fields = new Set();
        if (this.modelType instanceof graphql_1.GraphQLObjectType || this.modelType instanceof graphql_1.GraphQLInterfaceType) {
            const fieldMap = this.modelType.getFields();
            for (const fieldName in fieldMap) {
                fields.add(fieldMap[fieldName].name);
            }
            this.removeSuperFieldNames(fields, this.inheritanceInfo.upcastTypeMap.get(this.modelType));
        }
        return fields;
    }
    removeSuperFieldNames(fields, superTypes) {
        if (superTypes !== undefined) {
            for (const superType of superTypes) {
                if (superType instanceof graphql_1.GraphQLObjectType || superType instanceof graphql_1.GraphQLInterfaceType) {
                    const superFieldMap = superType.getFields();
                    for (const superFieldName in superFieldMap) {
                        fields.delete(superFieldName);
                    }
                }
                this.removeSuperFieldNames(fields, this.inheritanceInfo.upcastTypeMap.get(superType));
            }
        }
    }
}
exports.FetcherWriter = FetcherWriter;
function generatedFetcherTypeName(fetcherType, config) {
    var _a;
    const suffix = (_a = config.fetcherSuffix) !== null && _a !== void 0 ? _a : "Fetcher";
    return `${fetcherType.name}${suffix}`;
}
exports.generatedFetcherTypeName = generatedFetcherTypeName;
const COMMENT = `/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
`;
function instancePrefix(name) {
    return name.substring(0, 1).toLowerCase() + name.substring(1);
}
