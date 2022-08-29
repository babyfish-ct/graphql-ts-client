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
exports.FetcherWriter = void 0;
const graphql_1 = require("graphql");
const Utils_1 = require("./Utils");
const Writer_1 = require("./Writer");
class FetcherWriter extends Writer_1.Writer {
    constructor(modelType, ctx, stream, config) {
        var _a, _b, _c;
        super(stream, config);
        this.modelType = modelType;
        this.ctx = ctx;
        this.fetcherTypeName = `${this.modelType.name}${(_a = config.fetcherSuffix) !== null && _a !== void 0 ? _a : "Fetcher"}`;
        if (modelType instanceof graphql_1.GraphQLUnionType) {
            const map = {};
            const itemCount = modelType.getTypes().length;
            if (itemCount !== 0) {
                const fieldCountMap = new Map();
                for (const type of modelType.getTypes()) {
                    for (const fieldName in type.getFields()) {
                        fieldCountMap.set(fieldName, ((_b = fieldCountMap.get(fieldName)) !== null && _b !== void 0 ? _b : 0) + 1);
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
        else if (config.excludedTypes === undefined) {
            this.fieldMap = modelType.getFields();
        }
        else {
            const fieldMap = modelType.getFields();
            const filteredFieldMap = {};
            for (const fieldName in fieldMap) {
                const field = fieldMap[fieldName];
                const targetTypeName = (_c = Utils_1.targetTypeOf(field.type)) === null || _c === void 0 ? void 0 : _c.name;
                if (!Utils_1.isExecludedTypeName(config, targetTypeName)) {
                    filteredFieldMap[fieldName] = field;
                }
            }
            this.fieldMap = filteredFieldMap;
        }
        const fieldArgsMap = new Map();
        const fieldCategoryMap = new Map();
        const defaultFetcherProps = [];
        this.hasArgs = false;
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            const targetType = Utils_1.targetTypeOf(field.type);
            if (this.modelType.name !== "Query" &&
                this.modelType.name !== "Mutation" &&
                targetType === undefined &&
                field.args.length === 0 &&
                !field.isDeprecated) {
                if (config.defaultFetcherExcludeMap !== undefined) {
                    const excludeProps = config.defaultFetcherExcludeMap[modelType.name];
                    if (excludeProps !== undefined && excludeProps.filter(name => name === fieldName).length !== 0) {
                        continue;
                    }
                }
                defaultFetcherProps.push(fieldName);
            }
            if (field.args.length !== 0) {
                fieldArgsMap.set(fieldName, field.args);
            }
            const fieldCoreType = field.type instanceof graphql_1.GraphQLNonNull ?
                field.type.ofType :
                field.type;
            if (this.ctx.embeddedTypes.has(fieldCoreType)) {
                fieldCategoryMap.set(fieldName, "SCALAR");
            }
            else if (this.ctx.connections.has(fieldCoreType)) {
                fieldCategoryMap.set(fieldName, "CONNECTION");
            }
            else if (fieldCoreType instanceof graphql_1.GraphQLList) {
                const elementType = fieldCoreType.ofType instanceof graphql_1.GraphQLNonNull ?
                    fieldCoreType.ofType.ofType :
                    fieldCoreType.ofType;
                if (elementType instanceof graphql_1.GraphQLObjectType ||
                    elementType instanceof graphql_1.GraphQLInterfaceType ||
                    elementType instanceof graphql_1.GraphQLUnionType) {
                    fieldCategoryMap.set(fieldName, "LIST");
                }
            }
            else if (fieldCoreType instanceof graphql_1.GraphQLObjectType ||
                fieldCoreType instanceof graphql_1.GraphQLInterfaceType ||
                fieldCoreType instanceof graphql_1.GraphQLUnionType) {
                fieldCategoryMap.set(fieldName, "REFERENCE");
            }
            else if (this.ctx.idFieldMap.get(this.modelType) === field) {
                fieldCategoryMap.set(fieldName, "ID");
            }
            else {
                fieldCategoryMap.set(fieldName, "SCALAR");
            }
            if (field.args.length !== 0) {
                this.hasArgs = true;
            }
        }
        this.defaultFetcherProps = defaultFetcherProps;
        this.fieldArgsMap = fieldArgsMap;
        this.fieldCategoryMap = fieldCategoryMap;
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
        this.importStatement("import { ENUM_INPUT_METADATA } from '../EnumInputMetadata';");
        const importedFetcherTypeNames = new Set();
        importedFetcherTypeNames.add(this.superFetcherTypeName(this.modelType));
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            const targetType = Utils_1.targetTypeOf(field.type);
            if (targetType !== undefined) {
                importedFetcherTypeNames.add(this.superFetcherTypeName(targetType));
            }
        }
        this.importStatement(`import type { ${Array.from(importedFetcherTypeNames).join(", ")} } from 'graphql-ts-client-api';`);
        this.importStatement(`import { createFetcher, createFetchableType } from 'graphql-ts-client-api';`);
        if (this.modelType.name !== "Query" && this.modelType.name !== "Mutation") {
            this.importStatement("import type { WithTypeName, ImplementationType } from '../CommonTypes';");
        }
        for (const fieldName in this.fieldMap) {
            const field = this.fieldMap[fieldName];
            this.importFieldTypes(field);
        }
        const upcastTypes = this.ctx.inheritanceInfo.upcastTypeMap.get(this.modelType);
        if (upcastTypes !== undefined) {
            for (const upcastType of upcastTypes) {
                this.importStatement(`import { ${this.importedNamesForSuperType(upcastType).join(", ")} } from './${upcastType.name}${(_a = this.config.fetcherSuffix) !== null && _a !== void 0 ? _a : "Fetcher"}';`);
            }
        }
    }
    importedNamesForSuperType(superType) {
        return [`${Utils_1.instancePrefix(superType.name)}$`];
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
        t("<T extends object, TVariables extends object> extends ");
        t(this.superFetcherTypeName(this.modelType));
        t("<'");
        t(this.modelType.name);
        t("', T, TVariables> ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
            this.writeFragmentMethods();
            this.writeDirective();
            this.writeTypeName();
            for (const fieldName in this.fieldMap) {
                const field = this.fieldMap[fieldName];
                this.text("\n");
                this.writePositiveProp(field);
                this.writeNegativeProp(field);
            }
        });
        this.writeInstances();
        this.writeArgsInterface();
    }
    writeFragmentMethods() {
        const t = this.text.bind(this);
        if (this.modelType.name !== "Query" && this.modelType.name !== "Mutation") {
            t(`\non<XName extends ImplementationType<'${this.modelType.name}'>, X extends object, XVariables extends object>`);
            this.scope({ type: "PARAMETERS", multiLines: !(this.modelType instanceof graphql_1.GraphQLUnionType) }, () => {
                t(`child: ${this.superFetcherTypeName(this.modelType)}<XName, X, XVariables>`);
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
        }
    }
    writeDirective() {
        const t = this.text.bind(this);
        t(`\n\ndirective(name: string, args?: DirectiveArgs): ${this.fetcherTypeName}<T, TVariables>;\n`);
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
        this.writePositivePropImpl(field, "SIMPLEST");
        this.writePositivePropImpl(field, "WITH_ARGS");
        this.writePositivePropImpl(field, "WITH_OTPIONS");
        this.writePositivePropImpl(field, "FULL");
    }
    writeNegativeProp(field) {
        if (field.args.length !== 0 || Utils_1.targetTypeOf(field.type) !== undefined) {
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
        const withArgs = mode === "WITH_ARGS" || mode === "FULL";
        if (withArgs && field.args.length === 0) {
            return;
        }
        const targetType = Utils_1.targetTypeOf(field.type);
        const withOptions = mode === "WITH_OTPIONS" || mode === "FULL";
        const renderAsField = field.args.length === 0 && targetType === undefined && !withOptions;
        const namePlus = field.args.length === 0 && targetType === undefined && withOptions;
        const nonNull = field.type instanceof graphql_1.GraphQLNonNull;
        const t = this.text.bind(this);
        t("\n");
        if (field.deprecationReason) {
            t("/**\n");
            t(" * @deprecated");
            t(' ');
            t(field.deprecationReason);
            t("\n */\n");
        }
        if (renderAsField) {
            t("readonly ");
            t(field.name);
        }
        else {
            t(namePlus ? `"${field.name}+"` : field.name);
            if (withArgs || targetType !== undefined || withOptions) {
                this.scope({ type: "GENERIC", multiLines: true }, () => {
                    if (withArgs) {
                        this.separator(", ");
                        t(`XArgs extends AcceptableVariables<${this.modelType.name}Args['${field.name}']>`);
                    }
                    if (targetType !== undefined) {
                        this.separator(", ");
                        t("X extends object");
                        this.separator(", ");
                        t("XVariables extends object");
                    }
                    if (withOptions) {
                        this.separator(", ");
                        t(`XAlias extends string = "${field.name}"`);
                        if (nonNull) {
                            this.separator(", ");
                            t(`XDirectives extends { readonly [key: string]: DirectiveArgs } = {}`);
                        }
                        this.separator(", ");
                        t(`XDirectiveVariables extends object = {}`);
                    }
                });
            }
            this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                if (withArgs) {
                    this.separator(", ");
                    t("args: XArgs");
                }
                if (targetType !== undefined) {
                    this.separator(", ");
                    t("child: ");
                    t(this.superFetcherTypeName(targetType));
                    t("<'");
                    t(targetType.name);
                    t("', X, XVariables>");
                }
                if (withOptions) {
                    this.separator(", ");
                    t("optionsConfigurer: ");
                    this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                        t(`options: FieldOptions<"${field.name}", {}, {}>`);
                    });
                    t(` => FieldOptions<XAlias, ${nonNull ? "XDirectives" : "{readonly [key: string]: DirectiveArgs}"}, XDirectiveVariables>`);
                }
            });
        }
        t(": ");
        t(this.fetcherTypeName);
        this.scope({ type: "GENERIC", multiLines: !renderAsField, suffix: ";\n" }, () => {
            t("T & ");
            if (withOptions && nonNull) {
                this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                    t("XDirectives extends { readonly include: any } | { readonly skip: any } ? ");
                    this.scope({ type: "BLANK", multiLines: true }, () => {
                        this.writePositivePropChangedDataType(field, withOptions, true);
                        this.separator(" : ");
                        this.writePositivePropChangedDataType(field, withOptions, false);
                    });
                });
            }
            else {
                this.writePositivePropChangedDataType(field, withOptions, !nonNull);
            }
            this.separator(", ");
            t("TVariables");
            if (targetType !== undefined) {
                t(" & XVariables");
            }
            if (field.args.length !== 0) {
                if (withArgs) {
                    t(` & UnresolvedVariables<XArgs, ${this.modelType.name}Args['${field.name}']>`);
                }
                else {
                    t(` & ${this.modelType.name}Args["${field.name}"]`);
                }
            }
            if (withOptions) {
                t(" & XDirectiveVariables");
            }
        });
    }
    writePositivePropChangedDataType(field, withOptions, nullable) {
        const t = this.text.bind(this);
        t("{");
        if (!this.config.objectEditable) {
            t("readonly ");
        }
        if (withOptions) {
            t(`[key in XAlias]`);
        }
        else {
            t(`"${field.name}"`);
        }
        if (nullable) {
            t("?");
        }
        t(": ");
        this.typeRef(field.type, Utils_1.targetTypeOf(field.type) !== undefined ? "X" : undefined);
        t("}");
    }
    writeInstances() {
        const t = this.text.bind(this);
        const itemTypes = this.modelType instanceof graphql_1.GraphQLUnionType ? this.modelType.getTypes() : [];
        t("\nexport const ");
        t(this.emptyFetcherName);
        t(": ");
        t(this.fetcherTypeName);
        t("<{}, {}> = ");
        this.scope({ type: "BLANK", multiLines: true, suffix: ";\n" }, () => {
            t("createFetcher");
            this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                t("createFetchableType");
                this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                    t(`"${this.modelType.name}"`);
                    this.separator(", ");
                    if (this.ctx.embeddedTypes.has(this.modelType)) {
                        t('"EMBEDDED"');
                    }
                    else if (this.ctx.connections.has(this.modelType)) {
                        t('"CONNECTION"');
                    }
                    else if (this.ctx.edgeTypes.has(this.modelType)) {
                        t('"EDGE"');
                    }
                    else {
                        t('"OBJECT"');
                    }
                    this.separator(", ");
                    this.scope({ type: "ARRAY" }, () => {
                        const upcastTypes = this.ctx.inheritanceInfo.upcastTypeMap.get(this.modelType);
                        if (upcastTypes !== undefined) {
                            for (const upcastType of upcastTypes) {
                                this.separator(", ");
                                t(`${Utils_1.instancePrefix(upcastType.name)}$.fetchableType`);
                            }
                        }
                    });
                    this.separator(", ");
                    this.scope({ type: "ARRAY", multiLines: true }, () => {
                        for (const declaredFieldName of this.declaredFieldNames) {
                            const field = this.fieldMap[declaredFieldName];
                            this.separator(", ");
                            const args = this.fieldArgsMap.get(declaredFieldName);
                            const category = this.fieldCategoryMap.get(declaredFieldName);
                            const targetType = Utils_1.targetTypeOf(field.type);
                            if (args === undefined &&
                                (category === undefined || category === "SCALAR") &&
                                field.type instanceof graphql_1.GraphQLNonNull) {
                                if (targetType === undefined) {
                                    t(`"${declaredFieldName}"`);
                                }
                                else {
                                    this.scope({ type: "BLOCK", multiLines: true }, () => {
                                        t(`category: "SCALAR"`);
                                        this.separator(", ");
                                        t(`name: "${declaredFieldName}"`);
                                        this.separator(", ");
                                        t(`targetTypeName: "${targetType.name}"`);
                                    });
                                }
                            }
                            else {
                                this.scope({ type: "BLOCK", multiLines: true }, () => {
                                    t(`category: "${category !== null && category !== void 0 ? category : 'SCALAR'}"`);
                                    this.separator(", ");
                                    t(`name: "${declaredFieldName}"`);
                                    if (args !== undefined) {
                                        this.separator(", ");
                                        t("argGraphQLTypeMap: ");
                                        this.scope({ type: "BLOCK", multiLines: args.length > 1 }, () => {
                                            for (const arg of args) {
                                                this.separator(", ");
                                                t(arg.name);
                                                t(": '");
                                                this.gqlTypeRef(arg.type);
                                                t("'");
                                            }
                                        });
                                    }
                                    if (targetType !== undefined) {
                                        this.separator(", ");
                                        const connection = this.ctx.connections.get(targetType);
                                        if (connection !== undefined) {
                                            t(`connectionTypeName: "${targetType.name}"`);
                                            this.separator(", ");
                                            t(`edgeTypeName: "${connection.edgeType.name}"`);
                                            this.separator(", ");
                                            t(`targetTypeName: "${connection.nodeType.name}"`);
                                        }
                                        else {
                                            t(`targetTypeName: "${targetType.name}"`);
                                        }
                                    }
                                    if (!(field.type instanceof graphql_1.GraphQLNonNull)) {
                                        this.separator(", ");
                                        t("undefinable: true");
                                    }
                                });
                            }
                        }
                    });
                });
                this.separator(", ");
                this.text("ENUM_INPUT_METADATA");
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
        t(`\nexport interface ${this.modelType.name}Args `);
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
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
    get declaredFieldNames() {
        let set = this._declaredFieldNames;
        if (set === undefined) {
            this._declaredFieldNames = set = this.getDeclaredFieldNames();
        }
        return set;
    }
    getDeclaredFieldNames() {
        const fields = new Set();
        if (this.modelType instanceof graphql_1.GraphQLObjectType || this.modelType instanceof graphql_1.GraphQLInterfaceType) {
            const fieldMap = this.fieldMap;
            for (const fieldName in fieldMap) {
                fields.add(fieldMap[fieldName].name);
            }
            this.removeSuperFieldNames(fields, this.ctx.inheritanceInfo.upcastTypeMap.get(this.modelType));
        }
        else if (this.modelType instanceof graphql_1.GraphQLUnionType) {
            for (const fieldName in this.fieldMap) {
                fields.add(fieldName);
            }
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
                this.removeSuperFieldNames(fields, this.ctx.inheritanceInfo.upcastTypeMap.get(superType));
            }
        }
    }
    superFetcherTypeName(graphQLType) {
        if (this.ctx.connections.has(graphQLType)) {
            return "ConnectionFetcher";
        }
        if (this.ctx.edgeTypes.has(graphQLType)) {
            return "EdgeFetcher";
        }
        return "ObjectFetcher";
    }
}
exports.FetcherWriter = FetcherWriter;
const COMMENT = `/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
`;
