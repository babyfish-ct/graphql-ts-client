import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from "graphql";
import { join } from "path";
import { FetcherWriter } from "../FetcherWriter";
import { awaitStream, createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { InheritanceInfo } from "../InheritanceInfo";
import { RelayHookWriter } from "./RelayHookWriter";

export class RelayGenerator extends Generator {

    constructor(config: GeneratorConfig) {
        super(config);
    }

    protected createFetcheWriter(
        modelType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType,
        inheritanceInfo: InheritanceInfo,
        stream: WriteStream,
        config: GeneratorConfig
    ): FetcherWriter {
        return new FetcherWriter(
            true,
            modelType,
            inheritanceInfo,
            stream,
            config
        );
    }

    protected async generateServices(
        queryFields: GraphQLField<unknown, unknown>[],
        mutationFields: GraphQLField<unknown, unknown>[],
        promises: Promise<void>[]
    ) {
        if (queryFields.length !== 0) {
            promises.push(this.generateQueries(queryFields));
        }
        if (mutationFields.length !== 0) {
            promises.push(this.generateMutations(mutationFields));
        }
        promises.push(this.generateRelayFragment());
    }

    private async generateQueries(fields: GraphQLField<unknown, unknown>[]) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Queries.ts")
        );
        new RelayHookWriter("Query", fields, stream, this.config).write();
        awaitStream(stream);
    }

    private async generateMutations(fields: GraphQLField<unknown, unknown>[]) {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Mutations.ts")
        );
        new RelayHookWriter("Mutation", fields, stream, this.config).write();
        await awaitStream(stream);
    }

    private async generateRelayFragment() {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "TaggedNode.tsx")
        );
        stream.write(RELAY_FRAGMENT_CODE);
        await awaitStream(stream);
    }

    protected async writeIndexCode(stream: WriteStream, schema: GraphQLSchema) {
        stream.write("export { RelayQuery, RelayMutation, RelayFragment, createFragment } from './TaggedNode';\n");
        stream.write("export type { FragmentKey } from './TaggedNode';\n");
        if (Object.keys(schema.getQueryType()?.getFields() ?? {}).length !== 0) {
            stream.write("export { createQuery } from './Queries';\n");
        }
        if (Object.keys(schema.getMutationType()?.getFields() ?? {}).length !== 0) {
            stream.write("export { createMutation } from './Mutations';\n");
        }
    }
}

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