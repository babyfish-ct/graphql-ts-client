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
exports.EnumWriter = void 0;
const Writer_1 = require("./Writer");
class EnumWriter extends Writer_1.Writer {
    constructor(enumType, stream, config) {
        super(stream, config);
        this.enumType = enumType;
    }
    writeCode() {
        const t = this.text.bind(this);
        const values = this.enumType.getValues();
        if (this.config.tsEnum === true || this.config.tsEnum === "number" || this.config.tsEnum === "string") {
            t("export enum ");
            t(this.enumType.name);
            this.scope({
                type: "BLOCK",
                prefix: " ",
                suffix: "\n",
                multiLines: values.length > 3
            }, () => {
                for (const value of values) {
                    this.separator(", ");
                    if (this.config.tsEnum === "string") {
                        // Creates string enum type
                        t(value.name);
                        t(" = ");
                        t("'");
                        t(value.name);
                        t("'");
                    }
                    else {
                        // Creates number enum type 
                        t(value.name);
                    }
                }
            });
        }
        else {
            t("export type ");
            t(this.enumType.name);
            t(" = ");
            this.scope({
                type: "BLANK",
                suffix: ";\n",
                multiLines: values.length > 3
            }, () => {
                for (const value of values) {
                    this.separator(" | ");
                    t("'");
                    t(value.name);
                    t("'");
                }
            });
        }
    }
}
exports.EnumWriter = EnumWriter;
