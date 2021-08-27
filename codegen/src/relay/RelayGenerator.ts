import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from "graphql";
import { join } from "path";
import { FetcherWriter } from "../FetcherWriter";
import { awaitStream, createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";
import { InheritanceInfo } from "../InheritanceInfo";

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
        _1: GraphQLField<unknown, unknown>[],
        _2: GraphQLField<unknown, unknown>[],
        promises: Promise<void>[]
    ) {
        promises.push(this.generateRelayFragment());
    }

    private async generateRelayFragment() {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "Relay.ts")
        );
        stream.write(RELAY_FRAGMENT_CODE);
        await awaitStream(stream);
    }

    protected async writeIndexCode(stream: WriteStream, schema: GraphQLSchema) {
        stream.write(EXPORT_RELAY_TYPES_CODE);
        stream.write(EXPORT_RELAY_VARS_CODE);
    }
}

const EXPORT_RELAY_TYPES_CODE = `export type {
    PreloadedQueryOf, 
    OperationOf, 
    QueryResponseOf, 
    QueryVariablesOf, 
    FragmentDataOf, 
    FragmentKeyOf, 
    OperationType,
    FragmentKeyType
} from "./Relay";\n`;

const EXPORT_RELAY_VARS_CODE = `export {
    RelayQuery, 
    RelayMutation, 
    RelayFragment, 
    createTypedQuery,
    createTypedMutation,
    createTypedFragment,
    loadTypedQuery,
    useTypedQueryLoader,
    useTypedPreloadedQuery,
    useTypedLazyLoadQuery,
    useTypedFragment
} from "./Relay";\n`;

const RELAY_FRAGMENT_CODE = `
import type { Fetcher, FetcherField } from "graphql-ts-client-api";
import { FragmentWrapper, TextWriter, util } from "graphql-ts-client-api";
import { 
    EnvironmentProviderOptions, 
    loadQuery, 
    LoadQueryOptions, 
    PreloadedQuery, 
    useFragment, 
    useLazyLoadQuery, 
    useMutation, 
    UseMutationConfig, 
    usePreloadedQuery, 
    useQueryLoader 
} from "react-relay";
import { 
    GraphQLTaggedNode,
    ConcreteRequest, 
    NormalizationLocalArgumentDefinition, 
    NormalizationOperation, 
    NormalizationSelection, 
    ReaderArgument, 
    ReaderArgumentDefinition, 
    ReaderFragment, 
    ReaderSelection, 
    RequestParameters, 
    IEnvironment,
    RenderPolicy,
    FetchPolicy,
    CacheConfig,
    FragmentRefs,
    fetchQuery,
    MutationConfig,
    Disposable,
    Environment,
    FetchQueryFetchPolicy
} from "relay-runtime";
import { RelayObservable } from "relay-runtime/lib/network/RelayObservable";



/*
 * - - - - - - - - - - - - - - - - - - - - 
 *
 * PreloadedQueryOf
 * OperationOf
 * QueryResponseOf
 * QueryVariablesOf
 * FragmentDataOf
 * FragmentKeyOf
 * 
 * OperationType
 * FragmentKeyType
 * - - - - - - - - - - - - - - - - - - - - 
 */

export type PreloadedQueryOf<TRelayQuery> =
    TRelayQuery extends RelayQuery<infer TResponse, infer TVariables> ?
    PreloadedQuery<OperationType<TResponse, TVariables>> :
    never
;

export type OperationOf<TRelayOperation> =
    TRelayOperation extends RelayOperation<infer TResponse, infer TVariables> ?
    OperationType<TResponse, TVariables> :
    never
;

export type QueryResponseOf<TRelayQuery> =
    TRelayQuery extends RelayQuery<infer TResponse, any> ?
    TResponse :
    never
;

export type QueryVariablesOf<TRelayQuery> =
    TRelayQuery extends RelayQuery<any, infer TVariables> ?
    TVariables :
    never
;

export type FragmentDataOf<TRelayFragment> =
    TRelayFragment extends RelayFragment<string, string, infer TData, object> ?
    TData :
    never;

export type FragmentKeyOf<TRelayFragment> =
    TRelayFragment extends RelayFragment<infer TFragmentName, string, infer TData, object> ? 
    FragmentKeyType<TFragmentName, TData> :
    never
;

export type OperationType<TResponse, TVariables> = {
    readonly response: TResponse,
    readonly variables: TVariables
};

export type FragmentKeyType<TFragmentName extends string, TData extends object> = { 
    readonly " \$data": TData, 
    readonly " \$fragmentRefs": FragmentRefs<TFragmentName> 
} 



/*
 * - - - - - - - - - - - - - - - - - - - - 
 * createTypedQuery
 * createTypedMutation
 * createTypedFragment
 * - - - - - - - - - - - - - - - - - - - - 
 */

export function createTypedQuery<TResponse extends object, TVariables extends object>(
    name: string,
    fetcher: Fetcher<"Query", TResponse, TVariables>
): RelayQuery<TResponse, TVariables> {
    return new RelayQuery<TResponse, TVariables>(name, fetcher);
}

export function createTypedMutation<TResponse extends object, TVariables extends object>(
    name: string,
    fetcher: Fetcher<"Mutation", TResponse, TVariables>
): RelayQuery<TResponse, TVariables> {
    return new RelayMutation<TResponse, TVariables>(name, fetcher);
}

export function createTypedFragment<
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

export function useTypedFragment<TFragmentName extends string, TFetchable extends string, TData extends object>(
    fragment: RelayFragment<TFragmentName, TFetchable, TData, object>,
    fragmentRef: FragmentKeyType<TFragmentName, TData>,
): TData {
    return useFragment(
        fragment.taggedNode,
        fragmentRef
    );
}



/*
 * - - - - - - - - - - - - - - - - - - - - 
 * loadTypedQuery
 * useTypedQueryLoader
 * useTypedPreloadedQuery
 * useTypedLazyLoadQuery
 * useTypedMutation
 * - - - - - - - - - - - - - - - - - - - - 
 */

export function loadTypedQuery<
    TResponse,
	TVariables,
    TEnvironmentProviderOptions extends EnvironmentProviderOptions = {}
>(
    environment: IEnvironment,
    query: RelayQuery<TResponse, TVariables>,
    variables: TVariables,
    options?: LoadQueryOptions,
    environmentProviderOptions?: TEnvironmentProviderOptions,
): PreloadedQuery<OperationType<TResponse, TVariables>> {
	return loadQuery<OperationType<TResponse, TVariables>>(
		environment,
		query.taggedNode,
		variables,
		options,
		environmentProviderOptions
	);
}

export function fetchTypedQuery<TResponse, TVariables>(
    environment: Environment,
    query: RelayQuery<TResponse, TVariables>,
    variables: TVariables,
    cacheConfig?: { networkCacheConfig?: CacheConfig | null | undefined, fetchPolicy?: FetchQueryFetchPolicy | null | undefined } | null,
): RelayObservable<TResponse> {
    return fetchQuery<OperationType<TResponse, TVariables>>(
        environment,
        query.taggedNode,
        variables,
        cacheConfig
    );
}

export function useTypedQueryLoader<TResponse, TVariables>(
	query: RelayQuery<TResponse, TVariables>,
	initialQueryReference: PreloadedQuery<OperationType<TResponse, TVariables>> | null
) {
	return useQueryLoader<OperationType<TResponse, TVariables>>(
		query.taggedNode,
		initialQueryReference
	);
}

export function useTypedPreloadedQuery<TResponse, TVariables>(
    query: RelayQuery<TResponse, TVariables>,
    preloadedQuery: PreloadedQuery<OperationType<TResponse, TVariables>>,
    options?: {
        UNSTABLE_renderPolicy?: RenderPolicy | undefined;
    },
): TResponse {
	return usePreloadedQuery<OperationType<TResponse, TVariables>>(
		query.taggedNode,
		preloadedQuery,
		options
	);
}

export function useTypedLazyLoadQuery<TResponse, TVariables>(
    query: RelayQuery<TResponse, TVariables>,
    variables: TVariables,
    options?: {
        fetchKey?: string | number | undefined;
        fetchPolicy?: FetchPolicy | undefined;
        networkCacheConfig?: CacheConfig | undefined;
        UNSTABLE_renderPolicy?: RenderPolicy | undefined;
    },
): TResponse {
	return useLazyLoadQuery<OperationType<TResponse, TVariables>>(
		query.taggedNode,
		variables,
		options
	)
}

export function useTypedMutation<TResponse, TVariables>(
    mutation: RelayMutation<TResponse, TVariables>,
    commitMutationFn?: (
        environment: IEnvironment, 
        config: MutationConfig<OperationType<TResponse, TVariables>>
    ) => Disposable,
): [(config: UseMutationConfig<OperationType<TResponse, TVariables>>) => Disposable, boolean] {
    return useMutation(mutation.taggedNode, commitMutationFn);
}



/*
 * - - - - - - - - - - - - - - - - - - - - 
 * RelayOperation
 * RelayQuery
 * RelayMutation
 * RelayFragment
 * - - - - - - - - - - - - - - - - - - - - 
 */

export abstract class RelayOperation<TResponse, TVariables> {

    readonly taggedNode: GraphQLTaggedNode;

    constructor(
        operationType: "query" | "mutation",
        operationName: string,
        fetcher: Fetcher<string, object, object>
    ) {
        if (RELAY_OPERATION_MAP.has(operationName)) {
            throw new Error(
                \`The relay operation '\${operationName}' is aleary exists, please make sure: \` + 
                "1. Each relay operation is created and saved as constant under GLOBAL scope, " +
                "2. Each relay operation has a unique name"
            );
        }
        this.taggedNode = buildOperation(operationType, operationName, fetcher);
        RELAY_OPERATION_MAP.set(operationName, this);
    }

    __supressWarnings(vaiables: TVariables, response: TResponse) {
        throw new Error("Unspported function __supressWarnings");
    }
}

export class RelayQuery<TResponse, TVariables> extends RelayOperation<TResponse, TVariables> {

    constructor(
        operationName: string,
        fetcher: Fetcher<string, object, object>
    ) {
        super("query", operationName, fetcher);
    }
}

export class RelayMutation<TResponse, TVariables> extends RelayOperation<TResponse, TVariables> {

    constructor(
        operationName: string,
        fetcher: Fetcher<string, object, object>
    ) {
        super("mutation", operationName, fetcher);
    }
}

export class RelayFragment<TFragmentName extends string, TFetchable extends string, TData extends object, TUnresolvedVariables extends object> 
extends FragmentWrapper<TFragmentName, TFetchable, TData, TUnresolvedVariables> {

    readonly taggedNode: GraphQLTaggedNode;

    constructor(
        name: TFragmentName, 
        fetcher: Fetcher<TFetchable, TData, TUnresolvedVariables>
    ) {
        super(name, fetcher);
        if (RELAY_FRAGMENT_MAP.has(name)) {
            throw new Error(
                \`The relay fragment '\${name} is aleary exists, please make sure: \` +
                "1. Each relay fragment is created and saved as constant under GLOBAL scope " +
                "2. Each relay fragment has a unique name"
            );
        }
        this.taggedNode = buildFragment(name, fetcher);
        RELAY_FRAGMENT_MAP.set(name, this);
    }
}

const RELAY_OPERATION_MAP = new Map<string, RelayOperation<any, any>>();

const RELAY_FRAGMENT_MAP = new Map<string, RelayFragment<string, string, object, object>>();



/*
 * - - - - - - - - - - - - - - - - - - - - 
 * Internal functionalites: 
 * Conver Fetcher AST to relay GraphQLTaggedNode tree
 * 
 * This is why the framework can remove babel-plugin-relay and relay-compiler
 * - - - - - - - - - - - - - - - - - - - - 
 */

function buildOperation(
    operationType: "query" | "mutation",
    operationName: string,
    fetcher: Fetcher<string, object, object>
): ConcreteRequest {
    const argumentDefinitions: ReaderArgumentDefinition[] = [];
    util.iterateMap(fetcher.variableTypeMap, ([name, ]) => {
        argumentDefinitions.push({
            kind: "LocalArgument",
            name
        });
    });

    const args: ReaderArgument[] = [];
    util.iterateMap(fetcher.variableTypeMap, ([name, ]) => {
        args.push({
            kind: "Variable",
            name: name,
            variableName: name
        });
    });

    const fragment: ReaderFragment = {
        kind: "Fragment",
        metadata: null,
        name: operationName,
        argumentDefinitions,
        type: operationType === 'query' ? "Query" : "Mutation",
        selections: buildSelections(fetcher, false)
    };

    const operation: NormalizationOperation = {
        kind: "Operation",
        name: operationName,
        argumentDefinitions: argumentDefinitions as NormalizationLocalArgumentDefinition[],
        selections: buildSelections(fetcher, true) as NormalizationSelection[]
    }

    const writer = new TextWriter();
    writer.text(\`\${operationType} \${operationName}\`);
    if (fetcher.variableTypeMap.size !== 0) {
        writer.scope({type: "ARGUMENTS", multiLines: fetcher.variableTypeMap.size > 2, suffix: " "}, () => {
            util.iterateMap(fetcher.variableTypeMap, ([name, type]) => {
                writer.seperator(", ");
                writer.text(\`$\${name}: \${type}\`);
            });
        });
    }
    writer.text(fetcher.toString());
    writer.text(fetcher.toFragmentString());
    const text = writer.toString();

    const params: RequestParameters = {
        id: null,
        cacheID: util.toMd5(text),
        name: operationName,
        operationKind: operationType,
        metadata: {},
        text
    };

    return {
        kind: "Request",
        fragment,
        operation,
        params
    }
}

function buildFragment(name: string, fetcher: Fetcher<string, object, object>, forceInline: boolean = false): ReaderFragment {

    return {
        kind: "Fragment",
        name,
        metadata: null,
        type: fetcher.fetchableType.entityName,
        argumentDefinitions: [],
        selections: buildSelections(fetcher, forceInline)
    };
}

function buildSelections(fetcher: Fetcher<string, object, object>, forceInline: boolean): ReaderSelection[] {
    const selections: ReaderSelection[] = [];
    collectFetcherSelections(fetcher, forceInline, selections);
    return selections;
}

function collectFetcherSelections(fetcher: Fetcher<string, object, object>, forceInline: boolean, output: ReaderSelection[]) {
    for (const [fieldName, field] of fetcher.fieldMap) {
        collectFieldSelections(fieldName, field, forceInline, output);
    }
}

function collectFieldSelections(fieldName: string, field: FetcherField, forceInline: boolean, output: ReaderSelection[]) {

    if (field.childFetchers !== undefined) {
        if (fieldName === '...') {
            for (const childFetcher of field.childFetchers) {
                collectFetcherSelections(childFetcher, forceInline,  output);
            }
        } else if (!forceInline && fieldName.startsWith("...") && !fieldName.startsWith("... on ")) {
            const fragmentName = fieldName.substring(4).trim();
            output.push({
                kind: "FragmentSpread",
                name: fragmentName
            } as any);
        } else if (fieldName.startsWith("...")) {
            const fetcherGroupByTypeMap = new Map<string, Fetcher<string, object, object>[]>();
            for (const childFetcher of field.childFetchers) {
                let group = fetcherGroupByTypeMap.get(childFetcher.fetchableType.entityName);
                if (group === undefined) {
                    fetcherGroupByTypeMap.set(childFetcher.fetchableType.entityName, group = []);
                } 
                group.push(childFetcher);
            }
            for (const [typeName, childFetchers] of fetcherGroupByTypeMap) {
                const childSelections: ReaderSelection[] = [];
                for (const childFetcher of childFetchers) {
                    collectFetcherSelections(childFetcher, forceInline, childSelections);
                }
                output.push({
                    kind: "InlineFragment",
                    type: typeName,
                    selections: childSelections
                });
            }
        } else {
            const childSelections: ReaderSelection[] = [];
            for (const childFetcher of field.childFetchers) {
                collectFetcherSelections(childFetcher, forceInline, childSelections);
            }
            output.push({
                kind: "LinkedField",
                alias: actualAlias(fieldName, field),
                name: fieldName,
                storageKey: undefined,
                args: null,
                concreteType: field.childFetchers[0].fetchableType.entityName,
                plural: field.plural,
                selections: childSelections
            });
        }
    } else {
        output.push({
            kind: "ScalarField",
            alias: actualAlias(fieldName, field),
            name: fieldName,
            args: undefined,
            storageKey: undefined
        });
    }
}

function actualAlias(fieldName: string, field: FetcherField): string | undefined {
    const alias = field.fieldOptionsValue?.alias;
    if (alias === undefined || alias === "" || alias === fieldName) {
        return undefined;
    }
    return alias;
}
`;