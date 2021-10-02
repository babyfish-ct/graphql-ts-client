import { ConcreteRequest, GraphQLTaggedNode, ReaderFragment } from "relay-runtime";
import { Fetcher, SpreadFragment, TextWriter, util } from "graphql-ts-client-api";
import { Schema } from "relay-compiler";
import { createSchema } from "./Schema";
import { parseTaggedNode } from "./TaggedNode";

export class TypedEnvironment {

    private schema: Schema;

    private registry =new Registry();

    constructor(schema: string) {
        this.schema = createSchema(schema);
    }

    query<TResponse extends object, TVariables extends object>(
        operationName: string, 
        fetcher: Fetcher<"Query", TResponse, TVariables>
    ): TypedQuery<TResponse, TVariables> {
        return this.operation(operationName, fetcher);
    }

    mutation<TResponse extends object, TVariables extends object>(
        operationName: string, 
        fetcher: Fetcher<"Mutation", TResponse, TVariables>
    ): TypedMutation<TResponse, TVariables> {
        return this.operation(operationName, fetcher);
    }
    
    private operation<
        TOperationType extends "Query" | "Mutation",
        TResponse extends object, 
        TVariables extends object
    >(
        name: string, 
        fetcher: Fetcher<TOperationType, TResponse, TVariables>
    ): TypedOperation<TOperationType, TResponse, TVariables> {

        this.registry.validate(name);

        const writer = new TextWriter();
        writer.text(`${fetcher.fetchableType.name.toLowerCase()} ${name}`);
        if (fetcher.variableTypeMap.size !== 0) {
            writer.scope({type: "ARGUMENTS", multiLines: fetcher.variableTypeMap.size > 2, suffix: " "}, () => {
                util.iterateMap(fetcher.variableTypeMap, ([name, type]) => {
                    writer.seperator(", ");
                    writer.text(`$${name}: ${type}`);
                });
            });
        }
        writer.text(fetcher.toString());
        writer.text(fetcher.toFragmentString());

        const taggedNode = parseTaggedNode(this.schema, name, writer.toString()) as ConcreteRequest;
        const typedOperation: TypedOperation<TOperationType, TResponse, TVariables> = {
            name,
            fetcher,
            taggedNode
        };
        this.registry.register(taggedNode, name);
        return typedOperation;
    }

    fragment<
        TFragmentName extends string, 
        TFetchable extends string, 
        TData extends object, 
        TUnresolvedVariables extends object
    >(
        name: TFragmentName,
        fetcher: Fetcher<TFetchable, TData, TUnresolvedVariables>
    ): TypedFragment<
        TFragmentName, 
        TFetchable, 
        TData, 
        TUnresolvedVariables
    > {
        
        const refetchQueryName = (fetcher.directiveMap.get("refetchable") || {})["queryName"] as string | undefined;
        this.registry.validate(name, refetchQueryName);

        const taggedNode = parseTaggedNode(
            this.schema, 
            name, 
            `fragment ${name} on ${fetcher.fetchableType.name} ${fetcher.toString()}\n${fetcher.toFragmentString()}`
        ) as ReaderFragment;
        const typedFragment = new TypedFragmentImpl<TFragmentName, TFetchable, TData, TUnresolvedVariables>(
            name,
            fetcher,
            taggedNode
        );
        this.registry.register(taggedNode, name, refetchQueryName);
        return typedFragment;
    }
}

export type TypedQuery<TResponse extends object, TVariables extends object> = TypedOperation<"Query", TResponse, TVariables>;

export type TypedMutation<TResponse extends object, TVariables extends object> = TypedOperation<"Mutation", TResponse, TVariables>;

export interface TypedOperation<TOperationType extends "Query" | "Mutation", TResponse extends object, TVariables extends object> {

    readonly name: string;

    readonly fetcher: Fetcher<TOperationType, TResponse, TVariables>;

    readonly taggedNode: ConcreteRequest;
}

export interface TypedFragment<
    TFragmentName extends string, 
    TFetchable extends string, 
    TData extends object, 
    TUnresolvedVariables extends object
> {
    readonly name: TFragmentName;
    
    readonly fetcher: Fetcher<TFetchable, TData, TUnresolvedVariables>;

    readonly taggedNode: ReaderFragment;
}

class TypedFragmentImpl<
    TFragmentName extends string, 
    TFetchable extends string, 
    TData extends object, 
    TUnresolvedVariables extends object
> extends SpreadFragment<
    TFragmentName, 
    TFetchable, 
    TData, 
    TUnresolvedVariables
> implements TypedFragment<
    TFragmentName, 
    TFetchable, 
    TData, 
    TUnresolvedVariables
> {

    constructor(
        name: TFragmentName, 
        fetcher: Fetcher<TFetchable, TData, TUnresolvedVariables>,
        readonly taggedNode: ReaderFragment
    ) {
        super(name, fetcher);
    }
}

class Registry {

    private nodeMap = new Map<string, GraphQLTaggedNode>();

    // Key: reftech query name, value: fragmentName
    private refetchQueryFragmentMap = new Map<string, string>();

    private version: number = 0;

    validate(nodeName: string, refetchQueryName?: string) {
        this.refreshIfNecessary();
        if (this.nodeMap.has(nodeName)) {
            throw new Error(
                `Conflict root type node '${nodeName}'\n` +
                `1. Each TypedNode must be declared as constant under global scope\n` +
                `2. Each TypedNode needs to specify a unique name\n`
            );
        }
        if (refetchQueryName !== undefined) {
            if (this.nodeMap.has(refetchQueryName)) {
                throw new Error(
                    `The refetchable fragment '${nodeName}' is specified with @refetchable({queryName: "${refetchQueryName}"}), ` +
                    `but there is another root node named '${refetchQueryName}'\n`
                );
            }
            if (this.refetchQueryFragmentMap.has(refetchQueryName)) {
                throw new Error(
                    `The refetchable fragment '${nodeName}' is specified with @refetchable({queryName: "${refetchQueryName}"}), ` +
                    `but the other refetchable fragment ${this.refetchQueryFragmentMap.get(refetchQueryName)} uses the same refetch query name\n`
                );
            }
        }
    }

    register(taggedNode: GraphQLTaggedNode, nodeName: string, refetchQueryName?: string) {
        this.nodeMap.set(nodeName, taggedNode);
        if (refetchQueryName !== undefined) {
            this.refetchQueryFragmentMap.set(refetchQueryName, nodeName);
        }
    }

    private refreshIfNecessary() {
        if (this.version !== sourceCodeVersion) {
            console.log("The app is re-compiled, re-compile GraphQLTaggedNodes too");
            this.nodeMap = new Map<string, GraphQLTaggedNode>();
            this.refetchQueryFragmentMap = new Map<string, string>();
            this.version = sourceCodeVersion;
        }
    }
}

let sourceCodeVersion = 0;

const win = window as any;
if (typeof win.webpackHotUpdate === "function") {
    const oldUpdate = win.webpackHotUpdate;
    win.webpackHotUpdate = (...args: any[]) => {
        sourceCodeVersion++;
        oldUpdate.apply(this, args);
    };
    console.info("webpack-dev-server mode, listen hot deployment events");
} else {
    console.info(
        "Not webpack-dev-server mode, if the react-app is started by webpack-dev-server, ignore this message; " +
        "otherwise, the newest webpack-dev-server is changed so that this framework cannot work with it again, " +
        "please commit issue to let this framework can work with the newest webpack-dev-server"
    );
}