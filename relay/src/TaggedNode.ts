import { Schema } from "relay-compiler/lib/core/Schema";
import { GraphQLTaggedNode } from "relay-runtime";

export function parseTaggedNode(schema: Schema, name: string, graphql: string): GraphQLTaggedNode {
    const nodes = Parser.parse(schema, graphql);
    const context = new CompilerContext(schema).addAll(nodes);
    const results = (compileRelayArtifacts as CompileRelayArtifactsFunc)(
        context, {
            commonTransforms,
            fragmentTransforms,
            queryTransforms,
            codegenTransforms,
            printTransforms
        }
    );
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

function getRetchQueryName(node: any): string | undefined {
    let refetchQueryName = node.metadata?.refetch?.operation;
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

type CompileRelayArtifactsFunc = (ctx: any, transformers: any) => any;

const MODULE_START = "@@MODULE_START@@";
const MODULE_END = "@@MODULE_END@@";