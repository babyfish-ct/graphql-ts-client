"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchema = void 0;
const graphql_1 = require("graphql");
function createSchema(schema) {
    return create(new graphql_1.Source(schema), undefined, schemaExtensions);
}
exports.createSchema = createSchema;
process.hrtime = require('browser-process-hrtime');
const { schemaExtensions } = require("relay-compiler/lib/core/RelayIRTransforms");
const { create } = require("relay-compiler/lib/core/Schema");
