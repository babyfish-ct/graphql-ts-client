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
exports.argsWrapperTypeName = exports.AsyncOperationWriter = void 0;
const graphql_1 = require("graphql");
const Associations_1 = require("../Associations");
const Writer_1 = require("../Writer");
class AsyncOperationWriter extends Writer_1.Writer {
    constructor(mutation, field, stream, config) {
        super(stream, config);
        this.mutation = mutation;
        this.field = field;
        this.argsWrapperName = argsWrapperTypeName(field);
        this.associatedType = Associations_1.associatedTypeOf(this.field.type);
    }
    prepareImportings() {
        if (this.associatedType !== undefined) {
            this.importStatement("import { Fetcher, util } from 'graphql-ts-client-api';");
        }
        this.importStatement("import { graphQLClient } from '../Environment';");
        this.importFieldTypes(this.field);
    }
    writeCode() {
        const t = this.text.bind(this);
        t("export async function ");
        t(this.field.name);
        if (this.associatedType !== undefined) {
            t("<X extends object>");
        }
        this.enter("PARAMETERS", this.field.args.length !== 0 &&
            this.associatedType !== undefined);
        if (this.field.args.length !== 0) {
            this.separator(", ");
            if (this.argsWrapperName !== undefined) {
                t("args: ");
                t(this.argsWrapperName);
            }
            else {
                const arg = this.field.args[0];
                const nullable = !(arg.type instanceof graphql_1.GraphQLNonNull);
                const isLast = this.associatedType === undefined;
                t(arg.name);
                if (nullable && isLast) {
                    t("?");
                }
                t(": ");
                this.typeRef(arg.type);
                if (nullable && !isLast) {
                    t(" | undefined");
                }
            }
        }
        if (this.associatedType !== undefined) {
            this.separator(", ");
            t("fetcher: ");
            t("Fetcher<'");
            t(this.associatedType.name);
            t("', X>");
        }
        this.leave();
        t(": Promise<");
        this.typeRef(this.field.type, "X");
        t("> ");
        this.enter("BLOCK", true);
        this.writeGQL();
        t("const result = (await graphQLClient().request(gql");
        if (this.field.args.length !== 0) {
            t(", ");
            if (this.argsWrapperName !== undefined) {
                t("args");
            }
            else {
                const arg = this.field.args[0];
                t("{");
                t(arg.name);
                t("}");
            }
        }
        t("))['");
        t(this.field.name);
        t("'];\n");
        if (this.associatedType !== undefined) {
            t("util.removeNullValues(result);\n");
        }
        t("return result as ");
        this.typeRef(this.field.type, "X");
        t(";");
        this.leave("\n");
        t("\n");
        if (this.argsWrapperName !== undefined) {
            this.writeArgsWrapperType();
        }
    }
    writeArgsWrapperType() {
        const t = this.text.bind(this);
        const name = this.argsWrapperName;
        t(ARGS_COMMENT);
        t("export type ");
        t(name);
        t(" = ");
        this.enter("BLOCK", true);
        for (const arg of this.field.args) {
            if (!this.config.objectEditable) {
                t("readonly ");
            }
            t(arg.name);
            if (!(arg.type instanceof graphql_1.GraphQLNonNull)) {
                t("?");
            }
            t(": ");
            this.typeRef(arg.type);
            t(";\n");
        }
        this.leave("\n");
    }
    writeGQL() {
        const t = this.text.bind(this);
        const args = this.field.args;
        this.scope({ type: 'BLANK', multiLines: true, prefix: "const gql = `", suffix: "`;\n" }, () => {
            t(this.mutation ? "mutation" : "query");
            if (args.length !== 0) {
                this.enter("PARAMETERS", args.length > 2);
                for (const arg of args) {
                    this.separator(", ");
                    t("$");
                    t(arg.name);
                    t(": ");
                    this.gqlTypeRef(arg.type);
                }
                this.leave();
            }
            t(" ");
            this.scope({ type: "BLOCK", multiLines: true, suffix: '\n' }, () => {
                t(this.field.name);
                if (args.length !== 0) {
                    this.scope({ type: "PARAMETERS", multiLines: args.length > 2 }, () => {
                        for (const arg of args) {
                            this.separator(", ");
                            t(arg.name);
                            t(": $");
                            t(arg.name);
                        }
                    });
                }
                if (this.associatedType !== undefined) {
                    t(" ");
                    t("${fetcher.toString()}");
                }
            });
            if (this.associatedType !== undefined) {
                t("${fetcher.toFragmentString()}");
            }
        });
    }
}
exports.AsyncOperationWriter = AsyncOperationWriter;
function argsWrapperTypeName(field) {
    if (field.args.length < 2) {
        return undefined;
    }
    const name = field.name;
    return (`${name.substring(0, 1).toUpperCase()}${name.substring(1)}Args`);
}
exports.argsWrapperTypeName = argsWrapperTypeName;
const ARGS_COMMENT = `/*
 * This argument wrapper type is not interface, because interfaces 
 * do not satisfy the constraint 'SerializableParam' or recoil
 */
`;
