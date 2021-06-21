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

        t("export type ");
        t(this.enumType.name);
        t(" = ");

        const values = this.enumType.getValues();
        this.enter("BLANK", values.length > 3);
        for (const value of values) {
            this.separator(" | ");
            t("'");
            t(value.name);
            t("'");
        }
        this.leave(";\n");
    }
}