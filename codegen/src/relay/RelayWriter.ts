import { WriteStream } from "fs";
import { GraphQLField } from "graphql";
import { GeneratorConfig } from "../GeneratorConfig";
import { associatedTypeOf, instancePrefix, isPluralType } from "../Utils";
import { Writer } from "../Writer";

export class RelayWriter extends Writer {

    private readonly nodeField?: GraphQLField<unknown, unknown>;

    private readonly noNodeFieldError?: string;

    private readonly nodeTypeName?: string;

    constructor(private queryFields: GraphQLField<unknown, unknown>[], stream: WriteStream, config: GeneratorConfig) {
        super(stream, config);
        const field = this.queryFields.find(field => field.name === "node");
        if (field === undefined || field.args.length !== 1) {
            this.noNodeFieldError = "@refetchable becasue the service-side does not support the query: 'node(id: ID!): Node'";
        } else {
            const nodeTypeName = associatedTypeOf(field.type)?.name;
            if (isPluralType(field.type)) {
                this.noNodeFieldError = "Canot use @refetchable, the node query should not be plural";
            } else if (nodeTypeName === null) {
                this.noNodeFieldError = "Canot use @refetchable, the node query should return object";
            } else {
                this.nodeField = field;
                this.nodeTypeName = nodeTypeName;
            }
        }
    }

    protected isUnderGlobalDir() {
        return true;
    }

    protected prepareImportings() {
        this.importStatement(`import { useMemo } from 'react';`);
        this.importStatement(`import type { Fetcher, FetcherField } from "graphql-ts-client-api";`);
        this.importStatement(`import { FragmentWrapper, TextWriter, util } from "graphql-ts-client-api";`);
        this.importStatement(IMPORT_REACT_RELAY);
        this.importStatement(IMPORT_RELAY_RUTNIME);
        this.importStatement(`import { RelayObservable } from "relay-runtime/lib/network/RelayObservable";`);
        this.importStatement(`import { useRefetchableFragmentHookType } from "react-relay/relay-hooks/useRefetchableFragment";`);
        if (this.nodeField !== undefined && this.nodeTypeName !== undefined) {
            this.importStatement(`import { downcastTypes } from  "./CommonTypes";`);
            this.importStatement(`import { query$, ${instancePrefix(this.nodeTypeName)}$ } from  "./fetchers";`);
        }
    }

    protected writeCode() {
        let relayCode: string;
        if (this.indent === STATIC_IDENT) {
            relayCode = RELAY_CODE;
        } else {
            relayCode = RELAY_CODE.replace(STATIC_IDENT, this.indent);
        }
        this.text(relayCode);
        this.writeBuildRefetchQueryRequest();
    }

    private writeBuildRefetchQueryRequest() {

        const t = this.text.bind(this);

        t("\nfunction createRefetchQueryRequest");
        this.scope({type: "PARAMETERS", suffix: " "}, () => {
            t("queryName: string");
            this.separator(", ");
            t("fragmentName: string");
            this.separator(", ");
            t("fetcher: Fetcher<string, object, object>");
        });
        t(": ConcreteRequest ");
        this.scope({type: "BLOCK", multiLines: true}, () => {
            if (this.nodeField === undefined || this.nodeTypeName === undefined) {
                t(`throw new Error("${this.noNodeFieldError}");\n`);
                return;
            }
            t(`if (downcastTypes("${this.nodeTypeName}").findIndex(downcastType => downcastType === fetcher.fetchableType.entityName) === -1) `);
            this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
                t(`throw new Error(\`'\${fetcher.fetchableType.entityName}' does not inherit the node type '${this.nodeTypeName}'\`);`);
            });
            t(`const refetchFetcher = query$.node((${instancePrefix(this.nodeTypeName)}$ as any).on(fetcher, fragmentName));\n`);
            t(`return new TaggedNodeFactory(true).createOperation(queryName, refetchFetcher);\n`);
        });
    }
}

const IMPORT_REACT_RELAY = `import { 
    loadQuery, 
    useQueryLoader, 
    usePreloadedQuery,
    useLazyLoadQuery, 
    useMutation, 
    useFragment,
    useRefetchableFragment,
    EnvironmentProviderOptions,
    PreloadedQuery, 
    LoadQueryOptions,
    UseMutationConfig
} from "react-relay";`;

const IMPORT_RELAY_RUTNIME = `import { 
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
    FetchQueryFetchPolicy,
    ReaderRefetchMetadata
} from "relay-runtime";`;

const RELAY_CODE = `
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



/*
 * - - - - - - - - - - - - - - - - - - - - 
 * loadTypedQuery
 * useTypedQueryLoader
 * useTypedPreloadedQuery
 * useTypedLazyLoadQuery
 * useTypedMutation
 * useTypedFragment
 * useTypedRefetchableFragment
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
	const response = usePreloadedQuery<OperationType<TResponse, TVariables>>(
		query.taggedNode,
		preloadedQuery,
		options
	);
    return useMemo(() => {
        return util.exceptNullValues(response);
    }, [response]);
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
	const response = useLazyLoadQuery<OperationType<TResponse, TVariables>>(
		query.taggedNode,
		variables,
		options
	)
    return useMemo(() => {
        return util.exceptNullValues(response);
    }, [response]);
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

export function useTypedFragment<TFragmentName extends string, TFetchable extends string, TData extends object>(
    fragment: RelayFragment<TFragmentName, TFetchable, TData, object>,
    fragmentRef: FragmentKeyType<TFragmentName, TData>,
): TData;

export function useTypedFragment<TFragmentName extends string, TFetchable extends string, TData extends object>(
    fragment: RelayFragment<TFragmentName, TFetchable, TData, object>,
    fragmentRef: FragmentKeyType<TFragmentName, TData> | undefined,
): TData | undefined{
    const data = useFragment(
        fragment.taggedNode,
        fragmentRef ?? null
    );
    return useMemo(() => {
        return util.exceptNullValues(data) as TData | undefined;
    }, [data]);
}

export function useTypedRefetchableFragment<TFragmentName extends string, TFetchable extends string, TData extends object, TVariables extends object>(
    fragment: RelayFragment<TFragmentName, TFetchable, TData, TVariables>,
    fragmentRef: FragmentKeyType<TFragmentName, TData>,
): useRefetchableFragmentHookType<OperationType<TData, TVariables>, FragmentKeyType<TFragmentName, TVariables>, TData>;

export function useTypedRefetchableFragment<TFragmentName extends string, TFetchable extends string, TData extends object, TVariables extends object>(
    fragment: RelayFragment<TFragmentName, TFetchable, TData, TVariables>,
    fragmentRef: FragmentKeyType<TFragmentName, TData> | undefined,
): useRefetchableFragmentHookType<OperationType<TData, TVariables>, FragmentKeyType<TFragmentName, TVariables>, TData | undefined> {
    const tuple = useRefetchableFragment(
        fragment.taggedNode,
        fragmentRef ?? null
    );
    return useMemo(() => {
        return [
            util.exceptNullValues(tuple[0]) as TData | undefined,
            tuple[1]
        ];
    }, [tuple]);
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
        this.taggedNode = new TaggedNodeFactory().createOperation(operationName, fetcher);
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
        this.taggedNode = new TaggedNodeFactory().createFragment(name, fetcher);
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

class TaggedNodeFactory {

    private inlineFragment: boolean = false;

    constructor(private ignoreMetadata: boolean = false) {}

    createOperation(
        operationName: string,
        fetcher: Fetcher<string, object, object>
    ): ConcreteRequest {

        const operationType = fetcher.fetchableType.entityName === "Query" ? "query" : "mutation";

        const argumentDefinitions: ReaderArgumentDefinition[] = [];
        util.iterateMap(fetcher.variableTypeMap, ([name, ]) => {
            argumentDefinitions.push({
                kind: "LocalArgument",
                name
            });
        });

        const fragment: ReaderFragment = {
            kind: "Fragment",
            metadata: null,
            name: operationName,
            argumentDefinitions,
            type: operationType === 'query' ? "Query" : "Mutation",
            selections: this.createSelections(fetcher)
        };

        const operation: NormalizationOperation = {
            kind: "Operation",
            name: operationName,
            argumentDefinitions: argumentDefinitions as NormalizationLocalArgumentDefinition[],
            selections: this.inliningFragment(
                () => this.createSelections(fetcher)
            ) as NormalizationSelection[]
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

    createFragment(name: string, fetcher: Fetcher<string, object, object>): ReaderFragment {

        let refetchMetadata: ReaderRefetchMetadata | undefined = undefined;
        if (!this.ignoreMetadata) {
            const refetchDirectiveArgs = fetcher.invisibleDirectiveMap.get("refetchable");
            if (refetchDirectiveArgs !== undefined) {
                const refetchQuery = createRefetchQueryRequest(refetchDirectiveArgs["queryName"] as string, name, fetcher);
                refetchMetadata = {
                    connection: null,
                    operation: refetchQuery,
                    fragmentPathInResult: ["node"],
                    identifierField: "id"
                };
            }
        }

        return {
            kind: "Fragment",
            name,
            metadata: refetchMetadata !== undefined ? { refetch: refetchMetadata } : undefined,
            type: fetcher.fetchableType.entityName,
            argumentDefinitions: [],
            selections: this.createSelections(fetcher)
        };
    }

    private createSelections(fetcher: Fetcher<string, object, object>): ReaderSelection[] {
        const selections: ReaderSelection[] = [];
        this.collectFetcherSelections(fetcher, selections);
        return selections;
    }

    private collectFetcherSelections(fetcher: Fetcher<string, object, object>, output: ReaderSelection[]) {
        for (const [fieldName, field] of fetcher.fieldMap) {
            this.collectFieldSelections(fieldName, field, output);
        }
    }

    private collectFieldSelections(fieldName: string, field: FetcherField, output: ReaderSelection[]) {

        let args: ReaderArgument[] | undefined = undefined;
        for (const argName in field.args) {
            if (args === undefined) {
                args = [];
            }
            args.push({
                kind: "Variable",
                name: argName,
                variableName: argName
            });
        }

        if (field.childFetchers !== undefined) {
            if (fieldName === '...') {
                for (const childFetcher of field.childFetchers) {
                    this.collectFetcherSelections(childFetcher, output);
                }
            } else if (!this.inlineFragment && fieldName.startsWith("...") && !fieldName.startsWith("... on ")) {
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
                        this.collectFetcherSelections(childFetcher, childSelections);
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
                    this.collectFetcherSelections(childFetcher, childSelections);
                }
                output.push({
                    kind: "LinkedField",
                    alias: this.actualAlias(fieldName, field),
                    name: fieldName,
                    storageKey: undefined,
                    args,
                    concreteType: field.childFetchers[0].fetchableType.entityName,
                    plural: field.plural,
                    selections: childSelections
                });
            }
        } else {
            output.push({
                kind: "ScalarField",
                alias: this.actualAlias(fieldName, field),
                name: fieldName,
                args,
                storageKey: undefined
            });
        }
    }

    private actualAlias(fieldName: string, field: FetcherField): string | undefined {
        const alias = field.fieldOptionsValue?.alias;
        if (alias === undefined || alias === "" || alias === fieldName) {
            return undefined;
        }
        return alias;
    }

    private inliningFragment<R>(action: () => R): R {
        const old = this.inlineFragment;
        this.inlineFragment = true;
        try {
            return action();
        } finally {
            this.inlineFragment = old;
        }
    }
}
`;

const STATIC_IDENT = "    ";