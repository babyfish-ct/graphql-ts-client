"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputWriter = void 0;
const graphql_1 = require("graphql");
const Writer_1 = require("./Writer");
class InputWriter extends Writer_1.Writer {
    constructor(inputType, stream, config) {
        super(stream, config);
        this.inputType = inputType;
    }
    prepareImportings() {
        const fieldMap = this.inputType.getFields();
        for (const fieldName in fieldMap) {
            const field = fieldMap[fieldName];
            this.importType(field.type);
        }
    }
    importingBehavior(type) {
        if (type === this.inputType) {
            return "SELF";
        }
        if (type instanceof graphql_1.GraphQLInputObjectType) {
            return "SAME_DIR";
        }
        return "OTHER_DIR";
    }
    writeCode() {
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
            const field = fieldMap[fieldName];
            t(field.name);
            if (!(field.type instanceof graphql_1.GraphQLNonNull)) {
                t("?");
            }
            t(": ");
            this.typeRef(field.type);
            t(";\n");
        }
        this.leave("\n");
    }
}
exports.InputWriter = InputWriter;
