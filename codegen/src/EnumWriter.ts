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
import { GraphQLEnumType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";

export class EnumWriter extends Writer {

    constructor(
        private readonly enumType: GraphQLEnumType,
        stream: WriteStream,
        config: GeneratorConfig
    ) {
        super(stream, config);
    }

    protected writeCode() {

        const t = this.text.bind(this);
        const values = this.enumType.getValues();

        t("export type ");
        t(this.enumType.name);
        t(" = ");

        this.enter("BLANK", values.length > 3);
        for (const value of values) {
            this.separator(" | ");
            t("'");
            t(value.name);
            t("'");
        }
        this.leave(";\n\n");

        t("export enum ");
        t(this.enumType.name);
        t("Enum ");

        this.enter("BLOCK");
        this.enter("BLANK", values.length > 3);
        for (const value of values) {
            t(value.name);
            t(" = '");
            t(value.name);
            t("',\n");
        }
        this.leave();
        this.leave();
    }
}