
import { Fetcher, TextWriter, util } from "graphql-ts-client-api";

export type GraphQLExecutor = (request: string, variables: object) => Promise<any>;

export function setGraphQLExecutor(exeucotr: GraphQLExecutor, override: boolean = false) {
    if (graphQLExecutor !== undefined && !override) {
        throw new Error("'setGraphQLExecutor' can only be called once");
    }
    graphQLExecutor = exeucotr;
}

export async function execute<TData extends object, TVariables extends object>(
    fetcher: Fetcher<"Query" | "Mutation", TData, TVariables>,
    options?: {
        readonly operationName?: string,
        readonly variables?: TVariables
    }
) : Promise<TData> {

    const executor = graphQLExecutor;
    if (executor === undefined) {
        throw new Error("'setGraphQLExecutor' has not been called");
    }

    const writer = new TextWriter();
    writer.text(`${fetcher.fetchableType.entityName.toLowerCase()} ${options?.operationName ?? ''}`);
    if (fetcher.variableTypeMap.size !== 0) {
        writer.scope({type: "ARGUMENTS", multiLines: fetcher.variableTypeMap.size > 2, suffix: " "}, () => {
            util.iterateMap(fetcher.variableTypeMap, ([name, type]) => {
                writer.seperator();
                writer.text(`$${name}: ${type}`);
            });
        });
    }
    writer.text(fetcher.toString());
    writer.text(fetcher.toFragmentString());

    const rawResponse = util.removeNullValues(await executor(writer.toString(), options?.variables ?? {}));
    if (rawResponse.errors) {
        throw new GraphQLError(rawResponse.errors);
    }
    return rawResponse.data as TData;
}

export interface Response<TData> {
    readonly data?: TData;
    readonly error?: Error;
}

export class GraphQLError extends Error {
    
    readonly errors: readonly GraphQLSubError[];

    constructor(errors: any) {
        super();
        this.errors = errors;
    }
}

export interface GraphQLSubError {
    readonly message: string,
    readonly path: string[]
}

let graphQLExecutor: GraphQLExecutor | undefined = undefined;