"use strict";
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
exports.RelayGenerator = void 0;
const path_1 = require("path");
const FetcherWriter_1 = require("../FetcherWriter");
const Generator_1 = require("../Generator");
const RelayHookWriter_1 = require("./RelayHookWriter");
class RelayGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    createFetcheWriter(modelType, inheritanceInfo, stream, config) {
        return new FetcherWriter_1.FetcherWriter(true, modelType, inheritanceInfo, stream, config);
    }
    generateServices(queryFields, mutationFields, promises) {
        return __awaiter(this, void 0, void 0, function* () {
            if (queryFields.length !== 0) {
                promises.push(this.generateQueries(queryFields));
            }
            if (mutationFields.length !== 0) {
                promises.push(this.generateMutations(mutationFields));
            }
            promises.push(this.generateRelayFragment());
        });
    }
    generateQueries(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Queries.ts"));
            new RelayHookWriter_1.RelayHookWriter("Query", fields, stream, this.config).write();
            Generator_1.awaitStream(stream);
        });
    }
    generateMutations(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Mutations.ts"));
            new RelayHookWriter_1.RelayHookWriter("Mutation", fields, stream, this.config).write();
            yield Generator_1.awaitStream(stream);
        });
    }
    generateRelayFragment() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "TaggedNode.tsx"));
            stream.write(RELAY_FRAGMENT_CODE);
            yield Generator_1.awaitStream(stream);
        });
    }
    writeIndexCode(stream, schema) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            stream.write("export { RelayQuery, RelayMutation, RelayFragment, createFragment } from './TaggedNode';\n");
            stream.write("export type { FragmentKey } from './TaggedNode';\n");
            if (Object.keys((_b = (_a = schema.getQueryType()) === null || _a === void 0 ? void 0 : _a.getFields()) !== null && _b !== void 0 ? _b : {}).length !== 0) {
                stream.write("export { createQuery } from './Queries';\n");
            }
            if (Object.keys((_d = (_c = schema.getMutationType()) === null || _c === void 0 ? void 0 : _c.getFields()) !== null && _d !== void 0 ? _d : {}).length !== 0) {
                stream.write("export { createMutation } from './Mutations';\n");
            }
        });
    }
}
exports.RelayGenerator = RelayGenerator;
const RELAY_FRAGMENT_CODE = `
import { graphql, GraphQLTaggedNode } from "relay-runtime";
import type { Fetcher } from "graphql-ts-client-api";
import { FragmentWrapper } from "graphql-ts-client-api";

export abstract class RelayOperation<TResponse, TVariables> {

    readonly taggedNode: GraphQLTaggedNode;

    constructor(readonly name: string, gql: string) {
        if (RELAY_OPERATION_MAP.has(name)) {
            throw new Error(
                \`The relay operation '\${name} is aleary exists, please make sure: \` + 
                "1. Each relay operation is created and saved as constant under GLOBAL scope, " +
                "2. Each relay operation has a unique name"
            );
        }
        this.taggedNode = graphql(gql);
        RELAY_OPERATION_MAP.set(name, this);
    }

    __supressWarnings(vaiables: TVariables, response: TResponse) {
        throw new Error("Unspported function __supressWarnings");
    }
}

/*
 * Example:
 *
 * import { DEPARTMENT_FRAGMENT } form '...';
 * 
 * export const DEPARTMENT_LIST_QUERY =
 *     createQuery(
 *         "DepartmentListQuery",
 *         "findDepartmentsLikeName",
 *         department$
 *         .on(DEPARTMENT_FRAGMENT)         
 *     );
 */
export class RelayQuery<TResponse, TVariables> extends RelayOperation<TResponse, TVariables> {

    constructor(name: string, gql: string) {
        super(name, gql);
    }
}

/*
 * Example:
 *
 * import { DEPARTMENT_FRAGMENT } form '...';
 * 
 * export const DEPARTMENT_MUTATION =
 *     createMutation(
 *         "DepartmentMutation",
 *         "mergeDepartment",
 *         department$$           
 *     );
 */
export class RelayMutation<TResponse, TVariables> extends RelayOperation<TResponse, TVariables> {

    constructor(name: string, gql: string) {
        super(name, gql);
    }
}

/*
 * Example:
 * 
 * export const DEPARTMENT_FRAGMENT =
 *     createFragment(
 *         "DepartmentFragment",
 *         department$$
 *         .employees(
 *             employee$$
 *         )           
 *     );
 */
export class RelayFragment<TFragmentName extends string, E extends string, T extends object, TUnresolvedVariables extends object> 
extends FragmentWrapper<TFragmentName, E, T, TUnresolvedVariables> {

    readonly taggedNode: GraphQLTaggedNode;

    constructor(
        name: TFragmentName, 
        fetcher: Fetcher<E, T, TUnresolvedVariables>
    ) {
        super(name, fetcher);
        if (RELAY_FRAGMENT_MAP.has(name)) {
            throw new Error(
                \`The relay fragment '\${name} is aleary exists, please make sure: \` +
                "1. Each relay fragment is created and saved as constant under GLOBAL scope " +
                "2. Each relay fragment has a unique name"
            );
        }
        this.taggedNode = graphql(\`fragment \${name} \${fetcher.toString()}\`);
        RELAY_FRAGMENT_MAP.set(name, this);
    }
}

export function createFragment<
    TFragmentName extends string, 
    E extends string, 
    T extends object, 
    TUnresolvedVariables extends object
>(
    name: TFragmentName, 
    fetcher: Fetcher<E, T, TUnresolvedVariables>
): RelayFragment<TFragmentName, E, T, TUnresolvedVariables> {
    return new RelayFragment<TFragmentName, E, T, TUnresolvedVariables>(name, fetcher);
}

export type FragmentKey<T> =
    T extends RelayFragment<infer TFragmentName, string, infer T, object> ? 
    { readonly " $data": T, readonly " $fragmentRefs": TFragmentName } :
    never
;

const RELAY_OPERATION_MAP = new Map<string, RelayOperation<any, any>>();

const RELAY_FRAGMENT_MAP = new Map<string, RelayFragment<string, string, object, object>>();
`;
