import { ConcreteRequest, GraphQLTaggedNode, ReaderFragment } from "relay-runtime";
import { Fetcher, InvisibleFragment, TextWriter, util } from "graphql-ts-client-api";
import { Schema } from "relay-compiler";
import { createSchema } from "./Schema";
import { parseTaggedNode } from "./TaggedNode";

export class TypedEnvironment {

    private schema: Schema;

    private cachedNodeMap = new Map<string, any>();

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
        if (this.cachedNodeMap.has(name)) {
            handleConflictError(name);
        }

        const writer = new TextWriter();
        writer.text(`${fetcher.fetchableType.entityName.toLowerCase()} ${name}`);
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
        this.cachedNodeMap.set(name, typedOperation);
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
        if (this.cachedNodeMap.has(name)) {
            handleConflictError(name);
        }

        const taggedNode = parseTaggedNode(
            this.schema, 
            name, 
            `fragment ${name} on ${fetcher.fetchableType.entityName} ${fetcher.toString()}\n${fetcher.toFragmentString()}`
        ) as ReaderFragment;
        const typedFragment = new TypedFragmentImpl<TFragmentName, TFetchable, TData, TUnresolvedVariables>(
            name,
            fetcher,
            taggedNode
        );
        this.cachedNodeMap.set(name, typedFragment);
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
> extends InvisibleFragment<
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

function handleConflictError(name: string) {
    const message = 
        `Conflict TypeNode name '${name}'\n` +
        `1. Each TypedNode must be declared as constant under global scope\n` +
        `2. Each TypedNode needs to specify a unique name\n`;
    if (process.env.NODE_ENV === 'development') {
        console.warn(
            message + 
            `3. If the above two points have been guaranteed but this problem is caused by hot deployment of webpack, please ignore this message`)
    } else {
        throw new Error(message);
    }
}