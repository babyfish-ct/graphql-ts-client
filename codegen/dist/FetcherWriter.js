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
    constructor(relay, modelType, inheritanceInfo, stream, config) {
        var _a;
        super(stream, config);
        this.relay = relay;
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
        const methodFields = new Map();
        const defaultFetcherProps = [];
        this.hasArgs = false;
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            const associatedType = Associations_1.associatedTypeOf(field.type);
            if (associatedType === undefined) {
                if (config.defaultFetcherExcludeMap !== undefined) {
                    const excludeProps = config.defaultFetcherExcludeMap[modelType.name];
                    if (excludeProps !== undefined && excludeProps.filter(name => name === fieldName).length !== 0) {
                        continue;
                    }
                }
                defaultFetcherProps.push(fieldName);
            }
            if (field.args.length !== 0 || associatedType !== undefined) {
                methodFields.set(field.name, field);
            }
            if (field.args.length !== 0) {
                this.hasArgs = true;
            }
        }
        this.defaultFetcherProps = defaultFetcherProps;
        this.methodFields = methodFields;
        let prefix = instancePrefix(this.modelType.name);
        this.emptyFetcherName = `${prefix}$`;
        this.defaultFetcherName = defaultFetcherProps.length !== 0 ? `${prefix}$$` : undefined;
    }
    prepareImportings() {
        var _a;
        this.importStatement("import { Fetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';");
        if (this.hasArgs) {
            this.importStatement("import type { AcceptableVariables, UnresolvedVariables } from 'graphql-ts-client-api';");
        }
        this.importStatement("import { WithTypeName, ImplementationType } from '../CommonTypes';");
        if (this.relay) {
            this.importStatement("import { FragmentRefs } from 'relay-runtime';");
            this.importStatement("import { RelayFragment } from '../TaggedNode';");
        }
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
        t("<T extends object, TUnresolvedVariables extends object> extends Fetcher<'");
        t(this.modelType.name);
        t("', T, TUnresolvedVariables> ");
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
        t("'>}, TUnresolvedVariables>;\n");
        t(`\non<XName extends ImplementationType<'${this.modelType.name}'>, X extends object, XUnresolvedVariables extends object>`);
        this.scope({ type: "PARAMETERS", multiLines: !(this.modelType instanceof graphql_1.GraphQLUnionType) }, () => {
            t("child: Fetcher<XName, X, XUnresolvedVariables>");
            if (!(this.modelType instanceof graphql_1.GraphQLUnionType)) {
                this.separator(", ");
                t("fragmentName?: string // undefined: inline fragment; otherwise, otherwise, real fragment");
            }
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
            this.separator(", ");
            t("TUnresolvedVariables & XUnresolvedVariables");
        });
        t(";\n");
        if (this.relay) {
            t(`\non<TFragmentName extends string, XUnresolvedVariables extends object>`);
            this.scope({ type: "PARAMETERS", multiLines: !(this.modelType instanceof graphql_1.GraphQLUnionType) }, () => {
                t(`child: RelayFragment<TFragmentName, "${this.modelType.name}", object, XUnresolvedVariables>`);
            });
            t(`: ${this.fetcherTypeName}`);
            this.scope({ type: "GENERIC", multiLines: true }, () => {
                t('T & { readonly " $fragmentRefs": FragmentRefs<TFragmentName>}');
                this.separator(", ");
                t("TUnresolvedVariables & XUnresolvedVariables");
            });
            t(";\n");
        }
        for (const fieldName in this.fieldMap) {
            t("\n");
            const field = this.fieldMap[fieldName];
            this.writePositiveProp(field);
            this.writeNegativeProp(field);
        }
        this.leave("\n");
        this.writeInstances();
        this.writeArgsTypesInterface();
    }
    writePositiveProp(field) {
        const t = this.text.bind(this);
        const associatedType = Associations_1.associatedTypeOf(field.type);
        if (field.args.length === 0 && associatedType === undefined) {
            t("readonly ");
            t(field.name);
        }
        else {
            t(field.name);
            this.scope({ type: "GENERIC", multiLines: field.args.length !== 0 }, () => {
                if (associatedType !== undefined) {
                    this.separator(", ");
                    t("X extends object");
                    this.separator(", ");
                    t("XUnresolvedVariables extends object");
                }
                ;
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t(`XArgs extends AcceptableVariables<ArgsTypes['${field.name}']>`);
                }
            });
            this.enter("PARAMETERS", true);
            {
                if (associatedType !== undefined) {
                    this.separator(", ");
                    t("child: ");
                    t("Fetcher<'");
                    t(associatedType.name);
                    t("', X, XUnresolvedVariables>");
                }
                if (field.args.length !== 0) {
                    this.separator(", ");
                    let hasNonNullArgs = false;
                    for (const argName in field.args) {
                        if (field.args[argName].type instanceof graphql_1.GraphQLNonNull) {
                            hasNonNullArgs = true;
                            break;
                        }
                    }
                    if (hasNonNullArgs) {
                        t("args: XArgs");
                    }
                    else {
                        t("args?: XArgs");
                    }
                }
            }
            this.leave();
        }
        t(": ");
        t(this.fetcherTypeName);
        this.scope({ type: "GENERIC", multiLines: this.methodFields.has(field.name), suffix: ";\n" }, () => {
            t("T & {");
            if (!this.config.objectEditable) {
                t("readonly ");
            }
            t(field.name);
            if (!(field.type instanceof graphql_1.GraphQLNonNull)) {
                t("?");
            }
            t(": ");
            this.typeRef(field.type, associatedType !== undefined ? "X" : undefined);
            t("}");
            this.separator(", ");
            t("TUnresolvedVariables");
            if (associatedType !== undefined) {
                t(" & XUnresolvedVariables");
            }
            if (field.args.length !== 0) {
                t(` & UnresolvedVariables<XArgs, ArgsTypes['${field.name}']>`);
            }
        });
    }
    writeNegativeProp(field) {
        if (field.args.length !== 0 || Associations_1.associatedTypeOf(field.type) !== undefined) {
            return;
        }
        const t = this.text.bind(this);
        t('readonly "~');
        t(field.name);
        t('": ');
        t(this.fetcherTypeName);
        t("<Omit<T, '");
        t(field.name);
        t("'>, TUnresolvedVariables>;\n");
    }
    writeInstances() {
        const t = this.text.bind(this);
        const itemTypes = this.modelType instanceof graphql_1.GraphQLUnionType ? this.modelType.getTypes() : [];
        t("\nexport const ");
        t(this.emptyFetcherName);
        t(": ");
        t(generatedFetcherTypeName(this.modelType, this.config));
        t("<{}, {}> = ");
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
                    this.scope({ type: "ARRAY", multiLines: this.methodFields.size !== 0 }, () => {
                        for (const declaredFieldName of this.declaredFieldNames()) {
                            this.separator(", ");
                            const methodField = this.methodFields.get(declaredFieldName);
                            if (methodField === undefined) {
                                t(`"${declaredFieldName}"`);
                            }
                            else {
                                this.scope({ type: "BLOCK", multiLines: true }, () => {
                                    t("type: 'METHOD'");
                                    this.separator(", ");
                                    t(`name: "${declaredFieldName}"`);
                                    if (methodField.args.length !== 0) {
                                        this.separator(", ");
                                        t("argGraphQLTypeMap: ");
                                        this.scope({ type: "BLOCK", multiLines: methodField.args.length > 1 }, () => {
                                            for (const arg of methodField.args) {
                                                this.separator(", ");
                                                t(arg.name);
                                                t(": '");
                                                this.gqlTypeRef(arg.type);
                                                t("'");
                                            }
                                        });
                                    }
                                });
                            }
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
            this.leave(";\n");
        }
    }
    writeArgsTypesInterface() {
        if (!this.hasArgs) {
            return;
        }
        const t = this.text.bind(this);
        t("\ninterface ArgsTypes ");
        this.scope({ type: "BLOCK", multiLines: true }, () => {
            for (const fieldName in this.fieldMap) {
                const field = this.fieldMap[fieldName];
                if (field.args.length !== 0) {
                    t(`${field.name}: `);
                    this.scope({ type: "BLOCK", multiLines: field.args.length > 1 }, () => {
                        for (const arg of field.args) {
                            this.separator(", ");
                            t(arg.name);
                            if (!(arg instanceof graphql_1.GraphQLNonNull)) {
                                t("?");
                            }
                            t(": ");
                            this.typeRef(arg.type);
                        }
                    });
                }
            }
        });
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
