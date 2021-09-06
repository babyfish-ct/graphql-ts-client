"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedEnvironment = void 0;
const graphql_ts_client_api_1 = require("graphql-ts-client-api");
const Schema_1 = require("./Schema");
const TaggedNode_1 = require("./TaggedNode");
class TypedEnvironment {
    constructor(schema) {
        this.cachedNodeMap = new Map();
        this.schema = Schema_1.createSchema(schema);
    }
    query(operationName, fetcher) {
        return this.operation(operationName, fetcher);
    }
    mutation(operationName, fetcher) {
        return this.operation(operationName, fetcher);
    }
    operation(name, fetcher) {
        if (this.cachedNodeMap.has(name)) {
            handleConflictError(name);
        }
        const writer = new graphql_ts_client_api_1.TextWriter();
        writer.text(`${fetcher.fetchableType.entityName.toLowerCase()} ${name}`);
        if (fetcher.variableTypeMap.size !== 0) {
            writer.scope({ type: "ARGUMENTS", multiLines: fetcher.variableTypeMap.size > 2, suffix: " " }, () => {
                graphql_ts_client_api_1.util.iterateMap(fetcher.variableTypeMap, ([name, type]) => {
                    writer.seperator(", ");
                    writer.text(`$${name}: ${type}`);
                });
            });
        }
        writer.text(fetcher.toString());
        writer.text(fetcher.toFragmentString());
        const taggedNode = TaggedNode_1.parseTaggedNode(this.schema, name, writer.toString());
        const typedOperation = {
            name,
            fetcher,
            taggedNode
        };
        this.cachedNodeMap.set(name, typedOperation);
        return typedOperation;
    }
    fragment(name, fetcher) {
        if (this.cachedNodeMap.has(name)) {
            handleConflictError(name);
        }
        const taggedNode = TaggedNode_1.parseTaggedNode(this.schema, name, `fragment ${name} on ${fetcher.fetchableType.entityName} ${fetcher.toString()}\n${fetcher.toFragmentString()}`);
        const typedFragment = new TypedFragmentImpl(name, fetcher, taggedNode);
        this.cachedNodeMap.set(name, typedFragment);
        return typedFragment;
    }
}
exports.TypedEnvironment = TypedEnvironment;
class TypedFragmentImpl extends graphql_ts_client_api_1.InvisibleFragment {
    constructor(name, fetcher, taggedNode) {
        super(name, fetcher);
        this.taggedNode = taggedNode;
    }
}
function handleConflictError(name) {
    const message = `Conflict TypeNode name '${name}'\n` +
        `1. Each TypedNode must be declared as constant under global scope\n` +
        `2. Each TypedNode needs to specify a unique name\n`;
    if (process.env.NODE_ENV === 'development') {
        console.warn(message +
            `3. If the above two points have been guaranteed but this problem is caused by hot deployment of webpack, please ignore this message`);
    }
    else {
        throw new Error(message);
    }
}
