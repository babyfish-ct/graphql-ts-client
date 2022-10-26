"use strict";
/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncGenerator = void 0;
const Generator_1 = require("../Generator");
const path_1 = require("path");
class AsyncGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    generateServices(_, promises) {
        return __awaiter(this, void 0, void 0, function* () {
            promises.push(this.generateAsync());
        });
    }
    generateAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = (0, Generator_1.createStreamAndLog)((0, path_1.join)(this.config.targetDir, "Async.ts"));
            stream.write(ASYNC_CODE);
            yield (0, Generator_1.closeStream)(stream);
        });
    }
    writeIndexCode(stream, schema) {
        stream.write(`export type { GraphQLExecutor } from "./Async";\n`);
        stream.write(`export { setGraphQLExecutor, execute } from "./Async";\n`);
        super.writeIndexCode(stream, schema);
    }
}
exports.AsyncGenerator = AsyncGenerator;
const ASYNC_CODE = `
import type { Fetcher } from "graphql-ts-client-api";
import { TextWriter, util } from "graphql-ts-client-api";

export type GraphQLExecutor = (request: string, variables: object) => Promise<any>;

export function setGraphQLExecutor(executor: GraphQLExecutor) {
    graphQLExecutor = executor;
}

export async function execute<TData extends object, TVariables extends object>(
    fetcher: Fetcher<"Query" | "Mutation", TData, TVariables>,
    options?: {
        readonly operationName?: string,
        readonly variables?: TVariables,
        readonly executor?: GraphQLExecutor
    }
) : Promise<TData> {

    const executor = options?.executor ?? graphQLExecutor;
    if (executor === undefined) {
        throw new Error("Executor not set. Call 'setGraphQLExecutor' first or pass executor in options.");
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

    const rawResponse = util.exceptNullValues(await executor(writer.toString(), options?.variables ?? {}));
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
