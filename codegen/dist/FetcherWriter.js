"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FETCHER_SUBFFIX = exports.FetcherWriter = void 0;
const graphql_1 = require("graphql");
const Writer_1 = require("./Writer");
class FetcherWriter extends Writer_1.Writer {
    constructor(modelType, stream, config) {
        var _a;
        super(stream, config);
        this.modelType = modelType;
        this.fetcherSuffix = (_a = this.config.fetcherSuffix) !== null && _a !== void 0 ? _a : exports.DEFAULT_FETCHER_SUBFFIX;
    }
    write() {
        const t = this.text.bind(this);
        t("import { Fetcher } from 'graphql-ts-client-api';\n\n");
        t("export interface ");
        t(this.modelType.name);
        t(this.fetcherSuffix);
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
        this.leave();
        t("\n");
    }
    writePositiveProp(field) {
        const t = this.text.bind(this);
        const associatedTypes = associatedTypesOf(field.type);
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
                    this.enter("NONE");
                    for (const associatedType of associatedTypes) {
                        this.separator(" | ");
                        t(associatedType.name);
                        t(this.fetcherSuffix);
                        t("<X>");
                    }
                    this.leave();
                }
            }
            this.leave();
        }
        t(": ");
        t(this.modelType.name);
        t(this.fetcherSuffix);
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
        t(this.modelType.name);
        t(this.fetcherSuffix);
        t("<Omit<T, '");
        t(field.name);
        t("'>>;\n");
    }
}
exports.FetcherWriter = FetcherWriter;
function associatedTypesOf(type) {
    if (type instanceof graphql_1.GraphQLNonNull) {
        return associatedTypesOf(type.ofType);
    }
    if (type instanceof graphql_1.GraphQLList) {
        return associatedTypesOf(type.ofType);
    }
    if (type instanceof graphql_1.GraphQLObjectType || type instanceof graphql_1.GraphQLInterfaceType) {
        return [type];
    }
    if (type instanceof graphql_1.GraphQLUnionType) {
        return type.getTypes();
    }
    return [];
}
exports.DEFAULT_FETCHER_SUBFFIX = "Fetcher";
