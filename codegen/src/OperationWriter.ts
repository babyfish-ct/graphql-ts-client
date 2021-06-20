import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLType, GraphQLUnionType } from "graphql";
import { associatedTypesOf } from "./Associations";
import { generatedFetcherTypeName } from "./FetcherWriter";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";

export class OperationWriter extends Writer {

    private readonly argsWrapperName?: string;

    private readonly associatedTypes: ReadonlyArray<GraphQLObjectType | GraphQLInterfaceType>;

    constructor(
        private readonly mutation: boolean,
        private readonly field: GraphQLField<unknown, unknown>,
        stream: WriteStream,
        config: GeneratorConfig
    ) {
        super(stream, config);
        this.argsWrapperName = argsWrapperTypeName(field);
        this.associatedTypes = associatedTypesOf(this.field.type);
    }

    protected prepareImportings() {
        if (this.associatedTypes.length !== 0) {
            this.importStatement("import {replaceNullValues} from 'graphql-ts-client-api';");
        }
        this.importStatement("import {graphQLClient} from '../GraphQLClient';");
        this.importFieldTypes(this.field);
    }

    protected writeCode() {

        const t = this.text.bind(this);
        
        t("export async function ")
        t(this.field.name);
        if (this.associatedTypes.length !== 0) {
            t("<X extends object>");
        }
        
        this.enter(
            "PARAMETERS", 
            this.field.args.length !== 0 && 
            this.associatedTypes.length !== 0
        );
        if (this.field.args.length !== 0) {
            this.separator(", ");
            if (this.argsWrapperName !== undefined) {
                t("args: ");
                t(this.argsWrapperName!);
            } else {
                const arg = this.field.args[0];
                const nullable = !(arg.type instanceof GraphQLNonNull);
                const isLast = this.associatedTypes.length === 0;
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
        if (this.associatedTypes.length !== 0) {
            this.separator(", ");
            t("fetcher: ");
            this.enter("BLANK");
            for (const associatedType of this.associatedTypes) {
                this.separator(" | ");
                t(generatedFetcherTypeName(associatedType, this.config));
                t("<X>");
            }
            this.leave();
        }
        this.leave();

        t(": Promise<");
        if (this.associatedTypes.length !== 0) {
            t("X");
        } else {
            this.typeRef(this.field.type);
        }
        t("> ");

        this.enter("BLOCK", true);

        this.writeGQL();

        t("const { data, errors } = await graphQLClient().request(gql");
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
        t(");\n");

        t("if (errors !== undefined && errors.length !== 0) ");
        this.enter("BLOCK", true);
        t("throw errors[0];\n");
        this.leave("\n");

        if (this.associatedTypes.length !== 0) {
            t("replaceNullValues(data);\n");
        }
        t("return data as ");
        if (this.associatedTypes.length !== 0) {
            t("X");
        } else {
            this.typeRef(this.field.type);
        }
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

        t("export interface ");
        t(name);
        t(" ")
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

        t("const gql = ");
        this.enter("BLANK", true, "`");
        t(this.mutation ? "mutation" : "query");
        if (args.length !== 0) {
            this.enter("PARAMETERS", args.length > 2);
            for (const arg of args) {
                this.separator(", ");
                t("$");
                t(arg.name);
                t(": ");
                this.writeGQLTypeRef(arg.type);
            }
            this.leave();
        }

        t(" ");
        this.enter("BLOCK", true);
        t(this.field.name);
        if (args.length !== 0) {
            this.enter("PARAMETERS", args.length > 2);
            for (const arg of args) {
                this.separator(", ");
                t(arg.name);
                t(": $");
                t(arg.name);
            }
            this.leave();
        }
        if (this.associatedTypes.length !== 0) {
            t(" ");
            t("${fetcher.graphql}");
        }
        this.leave("\n");

        this.leave("`;\n");
    }

    private writeGQLTypeRef(type: GraphQLType) {
        if (type instanceof GraphQLNonNull) {
            this.writeGQLTypeRef(type.ofType);
            this.text("!");
        } else if (type instanceof GraphQLList) {
            this.text("[");
            this.writeGQLTypeRef(type.ofType);
            this.text("]");
        } else if (type instanceof GraphQLUnionType) {
            this.enter("BLANK");
            for (const itemType of type.getTypes()) {
                this.separator(" | ");
                this.text(itemType.name);
            }
            this.leave();
        } else {
            this.text(type.name);
        }
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