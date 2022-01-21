"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedEnvironment = void 0;
const graphql_ts_client_api_1 = require("graphql-ts-client-api");
const Schema_1 = require("./Schema");
const TaggedNode_1 = require("./TaggedNode");
class TypedEnvironment {
    constructor(schema) {
        this.registry = new Registry();
        this.schema = (0, Schema_1.createSchema)(schema);
    }
    query(operationName, fetcher) {
        return this.operation(operationName, fetcher);
    }
    mutation(operationName, fetcher) {
        return this.operation(operationName, fetcher);
    }
    operation(name, fetcher) {
        this.registry.validate(name);
        const writer = new graphql_ts_client_api_1.TextWriter();
        writer.text(`${fetcher.fetchableType.name.toLowerCase()} ${name}`);
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
        const taggedNode = (0, TaggedNode_1.parseTaggedNode)(this.schema, name, writer.toString());
        const typedOperation = {
            name,
            fetcher,
            taggedNode
        };
        this.registry.register(taggedNode, name);
        return typedOperation;
    }
    fragment(name, fetcher) {
        const refetchQueryName = (fetcher.directiveMap.get("refetchable") || {})["queryName"];
        this.registry.validate(name, refetchQueryName);
        const taggedNode = (0, TaggedNode_1.parseTaggedNode)(this.schema, name, `fragment ${name} on ${fetcher.fetchableType.name} ${fetcher.toString()}\n${fetcher.toFragmentString()}`);
        const typedFragment = new TypedFragmentImpl(name, fetcher, taggedNode);
        this.registry.register(taggedNode, name, refetchQueryName);
        return typedFragment;
    }
}
exports.TypedEnvironment = TypedEnvironment;
class TypedFragmentImpl extends graphql_ts_client_api_1.SpreadFragment {
    constructor(name, fetcher, taggedNode) {
        super(name, fetcher);
        this.taggedNode = taggedNode;
    }
}
class Registry {
    constructor() {
        this.nodeMap = new Map();
        // Key: reftech query name, value: fragmentName
        this.refetchQueryFragmentMap = new Map();
        this.version = 0;
    }
    validate(nodeName, refetchQueryName) {
        this.refreshIfNecessary();
        if (this.nodeMap.has(nodeName)) {
            throw new Error(`Conflict root type node '${nodeName}'\n` +
                `1. Each TypedNode must be declared as constant under global scope\n` +
                `2. Each TypedNode needs to specify a unique name\n`);
        }
        if (refetchQueryName !== undefined) {
            if (this.nodeMap.has(refetchQueryName)) {
                throw new Error(`The refetchable fragment '${nodeName}' is specified with @refetchable({queryName: "${refetchQueryName}"}), ` +
                    `but there is another root node named '${refetchQueryName}'\n`);
            }
            if (this.refetchQueryFragmentMap.has(refetchQueryName)) {
                throw new Error(`The refetchable fragment '${nodeName}' is specified with @refetchable({queryName: "${refetchQueryName}"}), ` +
                    `but the other refetchable fragment ${this.refetchQueryFragmentMap.get(refetchQueryName)} uses the same refetch query name\n`);
            }
        }
    }
    register(taggedNode, nodeName, refetchQueryName) {
        this.nodeMap.set(nodeName, taggedNode);
        if (refetchQueryName !== undefined) {
            this.refetchQueryFragmentMap.set(refetchQueryName, nodeName);
        }
    }
    refreshIfNecessary() {
        if (this.version !== sourceCodeVersion) {
            console.log("The app is re-compiled, re-compile GraphQLTaggedNodes too");
            this.nodeMap = new Map();
            this.refetchQueryFragmentMap = new Map();
            this.version = sourceCodeVersion;
        }
    }
}
let sourceCodeVersion = 0;
const win = window;
if (typeof win.webpackHotUpdate === "function") {
    const oldUpdate = win.webpackHotUpdate;
    win.webpackHotUpdate = (...args) => {
        sourceCodeVersion++;
        oldUpdate.apply(this, args);
    };
    console.info("webpack-dev-server mode, listen hot deployment events");
}
else {
    console.info("Not webpack-dev-server mode, if the react-app is started by webpack-dev-server, ignore this message; " +
        "otherwise, the newest webpack-dev-server is changed so that this framework cannot work with it again, " +
        "please commit issue to let this framework can work with the newest webpack-dev-server");
}
