"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTaggedNode = void 0;
function parseTaggedNode(schema, name, graphql) {
    const nodes = Parser.parse(schema, graphql);
    const context = new CompilerContext(schema).addAll(nodes);
    const results = compileRelayArtifacts(context, {
        commonTransforms,
        fragmentTransforms,
        queryTransforms,
        codegenTransforms,
        printTransforms
    });
    for (const result of results) {
        if (result[0].name === name) {
            const node = result[1];
            const refetchQueryName = getRetchQueryName(node);
            if (refetchQueryName !== undefined) {
                for (const refetchResult of results) {
                    if (refetchResult[0].name === refetchQueryName) {
                        node.metadata.refetch.operation = refetchResult[1];
                        break;
                    }
                }
            }
            return node;
        }
    }
    throw new Error(`Illegal name '${name}'`);
}
exports.parseTaggedNode = parseTaggedNode;
function getRetchQueryName(node) {
    var _a, _b;
    let refetchQueryName = (_b = (_a = node.metadata) === null || _a === void 0 ? void 0 : _a.refetch) === null || _b === void 0 ? void 0 : _b.operation;
    if (refetchQueryName !== undefined) {
        if (refetchQueryName.startsWith(MODULE_START)) {
            refetchQueryName = refetchQueryName.substring(MODULE_START.length);
        }
        if (refetchQueryName.endsWith(MODULE_END)) {
            refetchQueryName = refetchQueryName.substring(0, refetchQueryName.length - MODULE_END.length);
        }
        const dotIndex = refetchQueryName.indexOf(".");
        if (dotIndex !== -1) {
            refetchQueryName = refetchQueryName.substring(0, dotIndex);
        }
    }
    return refetchQueryName;
}
process.hrtime = require('browser-process-hrtime');
const compileRelayArtifacts = require("relay-compiler/lib/codegen/compileRelayArtifacts");
const { Parser, CompilerContext } = require("relay-compiler");
const { commonTransforms, codegenTransforms, fragmentTransforms, queryTransforms, printTransforms, schemaExtensions } = require("relay-compiler/lib/core/RelayIRTransforms");
const MODULE_START = "@@MODULE_START@@";
const MODULE_END = "@@MODULE_END@@";
