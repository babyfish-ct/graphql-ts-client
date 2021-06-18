"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatedFetcherTypeName = exports.FetcherWriter = void 0;
const graphql_1 = require("graphql");
const Associations_1 = require("./Associations");
const Writer_1 = require("./Writer");
class FetcherWriter extends Writer_1.Writer {
    constructor(modelType, stream, config) {
        super(stream, config);
        this.modelType = modelType;
        this.generatedName = generatedFetcherTypeName(modelType, config);
        const fieldMap = this.modelType.getFields();
        const methodNames = [];
        const propNames = [];
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName];
            if (Associations_1.associatedTypesOf(field.type).length !== 0) {
                methodNames.push(fieldName);
            }
            else if (field.args.length === 0) {
                propNames.push(fieldName);
            }
        }
        this.methodNames = methodNames;
        this.propNames = propNames;
        let instanceName = this.modelType.name;
        instanceName =
            instanceName.substring(0, 1).toLowerCase() +
                instanceName.substring(1);
        this.emptyFetcherName = `${instanceName}$`;
        this.defaultFetcherName = propNames.length !== 0 ? `${instanceName}$$` : undefined;
    }
    prepareImportings() {
        this.importStatement("import { Fetcher, createFetcher } from 'graphql-ts-client-api';");
        const fieldMap = this.modelType.getFields();
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName];
            this.importFieldTypes(field);
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
        t("export interface ");
        t(this.generatedName);
        t("<T> extends Fetcher<T> ");
        this.enter("BLOCK");
        t("\n");
        const fieldMap = this.modelType.getFields();
        for (const fieldName in fieldMap) {
            t("\n");
            const field = fieldMap[fieldName];
            this.writePositiveProp(field);
            this.writeNegativeProp(field);
        }
        this.leave("\n");
        t("\nexport const ");
        t(this.emptyFetcherName);
        t(" = createFetcher<");
        t(generatedFetcherTypeName(this.modelType, this.config));
        t("<{}>>");
        this.enter("PARAMETERS", this.methodNames.length > 3);
        for (const methodName of this.methodNames) {
            this.separator(", ");
            t("'");
            t(methodName);
            t("'");
        }
        this.leave(";\n");
        if (this.defaultFetcherName !== undefined) {
            t("\nexport const ");
            t(this.defaultFetcherName);
            t(" = ");
            t(this.emptyFetcherName);
            this.enter("BLANK", true);
            for (const propName of this.propNames) {
                t(".");
                t(propName);
                t("\n");
            }
            this.leave(";\n");
        }
    }
    writePositiveProp(field) {
        const t = this.text.bind(this);
        const associatedTypes = Associations_1.associatedTypesOf(field.type);
        if (field.args.length === 0 && associatedTypes.length === 0) {
            t("readonly ");
            t(field.name);
        }
        else {
            const multiLines = field.args.length +
                (associatedTypes.length !== 0 ? 1 : 0)
                > 1;
            t(field.name);
            if (associatedTypes.length !== 0) {
                t("<X>");
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
                if (associatedTypes.length !== 0) {
                    this.separator(", ");
                    t("child: ");
                    this.enter("BLANK");
                    for (const associatedType of associatedTypes) {
                        this.separator(" | ");
                        t(generatedFetcherTypeName(associatedType, this.config));
                        t("<X>");
                    }
                    this.leave();
                }
            }
            this.leave();
        }
        t(": ");
        t(this.generatedName);
        t("<T & {");
        if (!this.config.modelEditable) {
            t("readonly ");
        }
        t(field.name);
        if (!(field.type instanceof graphql_1.GraphQLNonNull)) {
            t("?");
        }
        t(": ");
        this.typeRef(field.type, associatedTypes.length !== 0 ? "X" : undefined);
        t("}>;\n");
    }
    writeNegativeProp(field) {
        const t = this.text.bind(this);
        t('readonly "~');
        t(field.name);
        t('": ');
        t(this.generatedName);
        t("<Omit<T, '");
        t(field.name);
        t("'>>;\n");
    }
}
exports.FetcherWriter = FetcherWriter;
function generatedFetcherTypeName(fetcherType, config) {
    var _a;
    const suffix = (_a = config.fetcherSuffix) !== null && _a !== void 0 ? _a : "Fetcher";
    return `${fetcherType.name}${suffix}`;
}
exports.generatedFetcherTypeName = generatedFetcherTypeName;
