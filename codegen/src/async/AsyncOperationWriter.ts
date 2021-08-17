/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLType, GraphQLUnionType } from "graphql";
import { associatedTypeOf } from "../Associations";
import { GeneratorConfig } from "../GeneratorConfig";
import { Writer } from "../Writer";

export class AsyncOperationWriter extends Writer {

    private readonly argsWrapperName?: string;

    private readonly associatedType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType | undefined;

    constructor(
        private readonly mutation: boolean,
        private readonly field: GraphQLField<unknown, unknown>,
        stream: WriteStream,
        config: GeneratorConfig
    ) {
        super(stream, config);
        this.argsWrapperName = argsWrapperTypeName(field);
        this.associatedType = associatedTypeOf(this.field.type);
    }

    protected prepareImportings() {
        if (this.associatedType !== undefined) {
            this.importStatement("import { Fetcher, util } from 'graphql-ts-client-api';");
        }
        this.importStatement("import { graphQLClient } from '../Environment';");
        this.importFieldTypes(this.field);
    }

    protected writeCode() {

        const t = this.text.bind(this);
        
        t("export async function ")
        t(this.field.name);
        if (this.associatedType !== undefined) {
            t("<X extends object>");
        }
        
        this.enter(
            "PARAMETERS", 
            this.field.args.length !== 0 && 
            this.associatedType !== undefined
        );
        if (this.field.args.length !== 0) {
            this.separator(", ");
            if (this.argsWrapperName !== undefined) {
                t("args: ");
                t(this.argsWrapperName!);
            } else {
                const arg = this.field.args[0];
                const nullable = !(arg.type instanceof GraphQLNonNull);
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
            } else {
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

    private writeArgsWrapperType() {
        
        const t = this.text.bind(this);
        const name = this.argsWrapperName!;

        t(ARGS_COMMENT);
        t("export type ");
        t(name);
        t(" = ")
        this.enter("BLOCK", true);

        for (const arg of this.field.args) {
            if (!this.config.objectEditable) {
                t("readonly ");
            }
            t(arg.name);
            if (!(arg.type instanceof GraphQLNonNull)) {
                t("?");
            }
            t(": ");
            this.typeRef(arg.type);
            t(";\n");
        }

        this.leave("\n");
    }

    private writeGQL() {

        const t = this.text.bind(this);
        const args = this.field.args;

        this.scope({type: 'BLANK', multiLines: true, prefix: "const gql = `", suffix: "`;\n"}, () => {
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
            this.scope({type: "BLOCK", multiLines: true, suffix: '\n'}, () => {
                t(this.field.name);
                if (args.length !== 0) {
                    this.scope({type: "PARAMETERS", multiLines: args.length > 2}, () => {
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

export function argsWrapperTypeName(
    field: GraphQLField<unknown, unknown>
): string | undefined {
    if (field.args.length < 2) {
        return undefined;
    }
    const name = field.name;
    return ( 
        `${
            name.substring(0, 1).toUpperCase()
        }${
            name.substring(1)
        }Args`
    );
}

const ARGS_COMMENT = `/*
 * This argument wrapper type is not interface, because interfaces 
 * do not satisfy the constraint 'SerializableParam' or recoil
 */
`;