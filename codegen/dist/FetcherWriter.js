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
const Utils_1 = require("./Utils");
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
        const pluralFields = new Map();
        const defaultFetcherProps = [];
        this.hasArgs = false;
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            const associatedType = Utils_1.associatedTypeOf(field.type);
            if (this.modelType.name !== "Query" && this.modelType.name !== "Mutation" && associatedType === undefined && field.args.length === 0) {
                if (config.defaultFetcherExcludeMap !== undefined) {
                    const excludeProps = config.defaultFetcherExcludeMap[modelType.name];
                    if (excludeProps !== undefined && excludeProps.filter(name => name === fieldName).length !== 0) {
                        continue;
                    }
                }
                defaultFetcherProps.push(fieldName);
            }
            if (Utils_1.isPluralType(field.type)) {
                pluralFields.set(field.name, field);
            }
            if (field.args.length !== 0 || associatedType !== undefined) {
                methodFields.set(field.name, field);
            }
            if (field.args.length !== 0) {
                this.hasArgs = true;
            }
        }
        this.defaultFetcherProps = defaultFetcherProps;
        this.pluralFields = pluralFields;
        this.methodFields = methodFields;
        let prefix = Utils_1.instancePrefix(this.modelType.name);
        this.emptyFetcherName = `${prefix}$`;
        this.defaultFetcherName = defaultFetcherProps.length !== 0 ? `${prefix}$$` : undefined;
    }
    prepareImportings() {
        var _a;
        if (this.hasArgs) {
            this.importStatement("import type { AcceptableVariables, UnresolvedVariables, FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';");
        }
        else {
            this.importStatement("import type { FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';");
        }
        this.importStatement("import { Fetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';");
        if (this.modelType.name !== "Query" && this.modelType.name !== "Mutation") {
            this.importStatement("import type { WithTypeName, ImplementationType } from '../CommonTypes';");
        }
        if (this.relay && this.modelType.name !== "Query" && this.modelType.name !== "Mutation") {
            this.importStatement("import { FragmentRefs } from 'relay-runtime';");
            this.importStatement("import { RelayFragment } from '../Relay';");
        }
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            this.importFieldTypes(field);
        }
        const upcastTypes = this.inheritanceInfo.upcastTypeMap.get(this.modelType);
        if (upcastTypes !== undefined) {
            for (const upcastType of upcastTypes) {
                this.importStatement(`import { ${Utils_1.instancePrefix(upcastType.name)}$ } from './${upcastType.name}${(_a = this.config.fetcherSuffix) !== null && _a !== void 0 ? _a : "Fetcher"}';`);
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
        this.writeFragment();
        this.writeDirective();
        this.writeTypeName();
        for (const fieldName in this.fieldMap) {
            this.text("\n");
            const field = this.fieldMap[fieldName];
            this.writePositiveProp(field);
            this.writeNegativeProp(field);
        }
        this.leave("\n");
        this.writeInstances();
        this.writeArgsInterface();
    }
    writeFragment() {
        const t = this.text.bind(this);
        t(COMMENT);
        t("export interface ");
        t(this.fetcherTypeName);
        t("<T extends object, TVariables extends object> extends Fetcher<'");
        t(this.modelType.name);
        t("', T, TVariables> ");
        this.enter("BLOCK", true);
        if (this.modelType.name !== "Query" && this.modelType.name !== "Mutation") {
            t(`\non<XName extends ImplementationType<'${this.modelType.name}'>, X extends object, XVariables extends object>`);
            this.scope({ type: "PARAMETERS", multiLines: !(this.modelType instanceof graphql_1.GraphQLUnionType) }, () => {
                t("child: Fetcher<XName, X, XVariables>");
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
                t("TVariables & XVariables");
            });
            t(";\n");
            if (this.relay) {
                t(`\non<XFragmentName extends string, XData extends object, XVariables extends object>`);
                this.scope({ type: "PARAMETERS", multiLines: !(this.modelType instanceof graphql_1.GraphQLUnionType) }, () => {
                    t(`child: RelayFragment<XFragmentName, "${this.modelType.name}", XData, XVariables>`);
                });
                t(`: ${this.fetcherTypeName}`);
                this.scope({ type: "GENERIC", multiLines: true }, () => {
                    t('T & ');
                    this.scope({ type: "BLOCK", multiLines: true }, () => {
                        t('readonly " $data": XData');
                        this.separator(", ");
                        t('readonly " $fragmentRefs": FragmentRefs<XFragmentName>');
                    });
                    this.separator(", ");
                    t("TVariables & XVariables");
                });
                t(";\n");
            }
        }
    }
    writeDirective() {
        const t = this.text.bind(this);
        t(`\n\ndirective(name: string, args?: DirectiveArgs): ${this.fetcherTypeName}<T, TVariables>;\n`);
        t(`\ninvisibleDirective(name: string, args?: DirectiveArgs): ${this.fetcherTypeName}<T, TVariables>;\n`);
    }
    writeTypeName() {
        if (this.modelType.name !== "Query" && this.modelType.name !== "Mutation") {
            const t = this.text.bind(this);
            t("\n\n");
            t("readonly __typename: ");
            t(this.fetcherTypeName);
            t("<T & {__typename: ImplementationType<'");
            t(this.modelType.name);
            t("'>}, TVariables>;\n");
        }
    }
    writePositiveProp(field) {
        const associatedType = Utils_1.associatedTypeOf(field.type);
        const isField = field.args.length === 0 && associatedType === undefined;
        if (field.args.length !== 0) {
            this.writePositivePropImpl(field, "NO_ARGS");
        }
        this.writePositivePropImpl(field, "NORMAL");
        if (isField) {
            this.writePositivePropImpl(field, "FIELD_PLUS");
        }
    }
    writeNegativeProp(field) {
        if (field.args.length !== 0 || Utils_1.associatedTypeOf(field.type) !== undefined) {
            return;
        }
        const t = this.text.bind(this);
        t('\nreadonly "~');
        t(field.name);
        t('": ');
        t(this.fetcherTypeName);
        t("<Omit<T, '");
        t(field.name);
        t("'>, TVariables>;\n");
    }
    writePositivePropImpl(field, mode) {
        const t = this.text.bind(this);
        const associatedType = Utils_1.associatedTypeOf(field.type);
        const renderAsField = field.args.length === 0 && associatedType === undefined && mode !== "FIELD_PLUS";
        const nonNull = field.type instanceof graphql_1.GraphQLNonNull;
        t("\n");
        if (renderAsField) {
            t("readonly ");
            t(field.name);
        }
        else {
            t(mode === "FIELD_PLUS" ? `"${field.name}+"` : field.name);
            this.scope({ type: "GENERIC", multiLines: true }, () => {
                if (field.args.length !== 0 && mode != "NO_ARGS") {
                    this.separator(", ");
                    t(`XArgs extends AcceptableVariables<${this.modelType.name}Args['${field.name}']>`);
                }
                if (associatedType !== undefined) {
                    this.separator(", ");
                    t("X extends object");
                    this.separator(", ");
                    t("XVariables extends object");
                }
                this.separator(", ");
                t(`XAlias extends string = "${field.name}"`);
                if (nonNull) {
                    this.separator(", ");
                    t(`XDirectives extends { readonly [key: string]: DirectiveArgs } = {}`);
                }
            });
            this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                if (field.args.length !== 0 && mode !== "NO_ARGS") {
                    this.separator(", ");
                    t("args: XArgs");
                }
                if (associatedType !== undefined) {
                    this.separator(", ");
                    t("child: ");
                    t("Fetcher<'");
                    t(associatedType.name);
                    t("', X, XVariables>");
                }
                this.separator(", ");
                t("optionsConfigurer?: ");
                this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                    t(`options: FieldOptions<"${field.name}", {}>`);
                });
                t(` => FieldOptions<XAlias, ${nonNull ? "XDirectives" : "{readonly [key: string]: DirectiveArgs}"}>`);
            });
        }
        t(": ");
        t(this.fetcherTypeName);
        this.scope({ type: "GENERIC", multiLines: !renderAsField, suffix: ";\n" }, () => {
            t("T & ");
            if (nonNull) {
                if (renderAsField) {
                    this.writePositivePropChangedDataType(field, renderAsField, false);
                }
                else {
                    this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                        t("XDirectives extends { readonly include: any } | { readonly skip: any } ? ");
                        this.scope({ type: "BLANK", multiLines: true }, () => {
                            this.writePositivePropChangedDataType(field, renderAsField, true);
                            this.separator(" : ");
                            this.writePositivePropChangedDataType(field, renderAsField, false);
                        });
                    });
                }
            }
            else {
                this.writePositivePropChangedDataType(field, renderAsField, true);
            }
            this.separator(", ");
            t("TVariables");
            if (associatedType !== undefined) {
                t(" & XVariables");
            }
            if (field.args.length !== 0) {
                if (mode === "NO_ARGS") {
                    t(` & ${this.modelType.name}Args["${field.name}"]`);
                }
                else {
                    t(` & UnresolvedVariables<XArgs, ${this.modelType.name}Args['${field.name}']>`);
                }
            }
        });
    }
    writePositivePropChangedDataType(field, renderAsField, nullable) {
        const t = this.text.bind(this);
        t("{");
        if (!this.config.objectEditable) {
            t("readonly ");
        }
        if (renderAsField) {
            t(`"${field.name}"`);
        }
        else {
            t(`[key in XAlias]`);
        }
        if (nullable) {
            t("?");
        }
        t(": ");
        this.typeRef(field.type, Utils_1.associatedTypeOf(field.type) !== undefined ? "X" : undefined);
        t("}");
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
                                t(`${Utils_1.instancePrefix(upcastType.name)}$.fetchableType`);
                            }
                        }
                    });
                    this.separator(", ");
                    this.scope({ type: "ARRAY", multiLines: this.methodFields.size !== 0 }, () => {
                        for (const declaredFieldName of this.declaredFieldNames()) {
                            this.separator(", ");
                            const pluralField = this.pluralFields.get(declaredFieldName);
                            const methodField = this.methodFields.get(declaredFieldName);
                            if (pluralField === undefined && methodField === undefined) {
                                t(`"${declaredFieldName}"`);
                            }
                            else {
                                this.scope({ type: "BLOCK", multiLines: true }, () => {
                                    t(`isFunction: ${methodField !== undefined}`);
                                    this.separator(", ");
                                    t(`isPlural: ${pluralField !== undefined}`);
                                    this.separator(", ");
                                    t(`name: "${declaredFieldName}"`);
                                    if (methodField !== undefined && methodField.args.length !== 0) {
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
    writeArgsInterface() {
        if (!this.hasArgs) {
            return;
        }
        const t = this.text.bind(this);
        t(`\ninterface ${this.modelType.name}Args `);
        this.scope({ type: "BLOCK", multiLines: true }, () => {
            for (const fieldName in this.fieldMap) {
                const field = this.fieldMap[fieldName];
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t(`\nreadonly ${field.name}: `);
                    this.scope({ type: "BLOCK", multiLines: true }, () => {
                        for (const arg of field.args) {
                            this.separator(", ");
                            t("readonly ");
                            t(arg.name);
                            if (!(arg.type instanceof graphql_1.GraphQLNonNull)) {
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
