import { WriteStream } from "fs";
import { GraphQLInputObjectType, GraphQLInterfaceType, GraphQLNamedType, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "./GeneratorConfig";
import { ImportingBehavior, Writer } from "./Writer";

export class InputWriter extends Writer {

    constructor(
        private readonly inputType: GraphQLInputObjectType,
        stream: WriteStream,
        config: GeneratorConfig
    ) {
        super(stream, config);
    }

    protected prepareImportings() {
        const fieldMap = this.inputType.getFields();
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName];
            this.importType(field.type);
        }
    }

    protected importingBehavior(type: GraphQLNamedType): ImportingBehavior {
        if (type === this.inputType) {
            return "SELF";
        }
        if (type instanceof GraphQLInputObjectType) {
            return "SAME_DIR";
        }
        return "OTHER_DIR";
    }

    protected writeCode() {

        const t = this.text.bind(this);

        t("export interface ");
        t(this.inputType.name);
        t(" ");
        this.enter("BLOCK", true);
        
        const fieldMap = this.inputType.getFields();
        for (const fieldName in fieldMap) {
            if (!this.config.objectEditable) {
                t("readonly ");
            }
            const field = fieldMap[fieldName]!;
            t(field.name);
            if (!(field.type instanceof GraphQLNonNull)) {
                t("?");
            }
            t(": ");
            this.typeRef(field.type);
            t(";\n");
        }

        this.leave("\n");
    }
}