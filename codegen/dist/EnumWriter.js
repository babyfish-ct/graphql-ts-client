"use strict";
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
exports.EnumWriter = EnumWriter;
