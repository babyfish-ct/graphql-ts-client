"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloQueryHookWriter = void 0;
const ApolloHookWriter_1 = require("./ApolloHookWriter");
class ApolloQueryHookWriter extends ApolloHookWriter_1.ApolloHookWriter {
    constructor(fields, stream, config) {
        super("Query", fields, stream, config);
    }
}
exports.ApolloQueryHookWriter = ApolloQueryHookWriter;
