"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTypeWriter = void 0;
const Writer_1 = require("./Writer");
class ObjectTypeWriter extends Writer_1.Writer {
    constructor(objectType, stream, config) {
        super(stream, config);
        this.objectType = objectType;
    }
    write() {
        const t = this.text.bind(this);
        t("import { Fetcher } from 'graphql-client';\n\n");
        t("export interface ");
        t(this.objectType.name);
        t("Fetcher<T> extends Fetcher<T> ");
        this.enter("BODY");
        t("\n");
        this.leave();
        t("\n");
    }
}
exports.ObjectTypeWriter = ObjectTypeWriter;
