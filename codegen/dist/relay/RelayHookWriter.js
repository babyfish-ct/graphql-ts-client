"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayHookWriter = void 0;
const Associations_1 = require("../Associations");
const Writer_1 = require("../Writer");
class RelayHookWriter extends Writer_1.Writer {
    constructor(hookType, fields, stream, config) {
        super(stream, config);
        this.hookType = hookType;
        this.fields = fields;
        this.hasTypedHooks = this.fields.find(field => Associations_1.associatedTypeOf(field.type) !== undefined) !== undefined;
        this.hasSimpleHooks = this.fields.find(field => Associations_1.associatedTypeOf(field.type) === undefined) !== undefined;
    }
    writeCode() {
    }
}
exports.RelayHookWriter = RelayHookWriter;
