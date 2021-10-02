/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { GraphQLSchema } from "graphql";
import { closeStream, createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { join } from "path";
import { WriteStream } from "fs";
import { FetcherContext } from "../FetcherContext";

export class AsyncGenerator extends Generator {

    constructor(config: GeneratorConfig) {
        super(config);
    }

    protected async generateServices(
        _: FetcherContext,
        promises: Promise<void>[]
    ) {
        promises.push(this.generateAsync());
    }

    private async generateAsync() {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Async.ts")
        );
        stream.write(ASYNC_CODE);
        await closeStream(stream);
    }

    protected async writeIndexCode(stream: WriteStream, schema: GraphQLSchema) {
        stream.write(`export type { GraphQLExecutor } from "./Async";\n`);
        stream.write(`export { setGraphQLExecutor, execute } from "./Async";\n`);
        await super.writeIndexCode(stream, schema);
    }
}

const ASYNC_CODE = `
import { Fetcher, TextWriter, util } from "graphql-ts-client-api";

export type GraphQLExecutor = (request: string, variables: object) => Promise<any>;

export function setGraphQLExecutor(exeucotr: GraphQLExecutor) {
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
    writer.text(\`\${fetcher.fetchableType.name.toLowerCase()} \${options?.operationName ?? ''}\`);
    if (fetcher.variableTypeMap.size !== 0) {
        writer.scope({type: "ARGUMENTS", multiLines: fetcher.variableTypeMap.size > 2, suffix: " "}, () => {
            util.iterateMap(fetcher.variableTypeMap, ([name, type]) => {
                writer.seperator();
                writer.text(\`$\${name}: \${type}\`);
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

let graphQLExecutor: GraphQLExecutor | undefined = undefined;`;