import { WriteStream } from "fs";
import { GraphQLEnumType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";

export class EnumWriter extends Writer {

    constructor(
        private enumType: GraphQLEnumType,
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
        this.leave();

        t(";\n");
    }
}