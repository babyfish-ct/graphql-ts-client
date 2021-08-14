"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloMutationHookWriter = void 0;
const ApolloHookWriter_1 = require("./ApolloHookWriter");
class ApolloMutationHookWriter extends ApolloHookWriter_1.ApolloHookWriter {
    constructor(fields, stream, config) {
        super("Mutation", fields, stream, config);
    }
}
exports.ApolloMutationHookWriter = ApolloMutationHookWriter;
