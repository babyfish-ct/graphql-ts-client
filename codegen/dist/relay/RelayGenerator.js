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
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Relay.ts"));
            stream.write(RELAY_FRAGMENT_CODE);
            yield Generator_1.awaitStream(stream);
        });
    }
    writeIndexCode(stream, schema) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            stream.write(EXPORT_RELAY_TYPES_CODE);
            stream.write(EXPORT_RELAY_VARS_CODE);
            if (Object.keys((_b = (_a = schema.getQueryType()) === null || _a === void 0 ? void 0 : _a.getFields()) !== null && _b !== void 0 ? _b : {}).length !== 0) {
                stream.write("export { createTypedQuery } from './Queries';\n");
            }
            if (Object.keys((_d = (_c = schema.getMutationType()) === null || _c === void 0 ? void 0 : _c.getFields()) !== null && _d !== void 0 ? _d : {}).length !== 0) {
                stream.write("export { createTypedMutation } from './Mutations';\n");
            }
        });
    }
}
exports.RelayGenerator = RelayGenerator;
const EXPORT_RELAY_TYPES_CODE = `export type {
    PreloadedQueryTypeOf, 
    QueryTypeOf, 
    QueryResponseOf, 
    QueryVariablesOf, 
    FragmentDataOf, 
    FragmentKeyOf, 
    QueryType, 
    FragmentKeyType
} from "./Relay";\n`;
const EXPORT_RELAY_VARS_CODE = `export {
    RelayQuery, 
    RelayMutation, 
    RelayFragment, 
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
    FragmentRefs
} from "relay-runtime";



////////////////////////////////////////////////////



export type PreloadedQueryTypeOf<TRelayQuery> =
    TRelayQuery extends RelayQuery<infer TResponse, infer TVariables> ?
    PreloadedQuery<QueryType<TResponse, TVariables>> :
    never
;

export type QueryTypeOf<TRelayQuery> =
    TRelayQuery extends RelayQuery<infer TResponse, infer TVariables> ?
    QueryType<TResponse, TVariables> :
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

export type QueryType<TResponse, TVariables> = {
    readonly response: TResponse,
    readonly variables: TVariables
};

export type FragmentKeyType<TFragmentName extends string, TData extends object> = { 
    readonly " \$data": TData, 
    readonly " \$fragmentRefs": FragmentRefs<TFragmentName> 
} 



////////////////////////////////////////////////////



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
): PreloadedQuery<QueryType<TResponse, TVariables>> {
	return loadQuery<QueryType<TResponse, TVariables>>(
		environment,
		query.taggedNode,
		variables,
		options,
		environmentProviderOptions
	);
}

export function useTypedQueryLoader<TResponse, TVariables>(
	query: RelayQuery<TResponse, TVariables>,
	initialQueryReference: PreloadedQuery<QueryType<TResponse, TVariables>> | null
) {
	return useQueryLoader<QueryType<TResponse, TVariables>>(
		query.taggedNode,
		initialQueryReference
	);
}

export function useTypedPreloadedQuery<TResponse, TVariables>(
    query: RelayQuery<TResponse, TVariables>,
    preloadedQuery: PreloadedQuery<QueryType<TResponse, TVariables>>,
    options?: {
        UNSTABLE_renderPolicy?: RenderPolicy | undefined;
    },
): TResponse {
	return usePreloadedQuery<QueryType<TResponse, TVariables>>(
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
	return useLazyLoadQuery<QueryType<TResponse, TVariables>>(
		query.taggedNode,
		variables,
		options
	)
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



////////////////////////////////////////////////////



export abstract class RelayOperation<TResponse, TVariables> {

    readonly taggedNode: GraphQLTaggedNode;

    constructor(
        operationType: "query" | "mutation",
        operationName: string,
        operationField: string,
        operationAlias: string | undefined,
        operationVariableMap: { [key: string]: string },
        plural: boolean,
        fetcher?: Fetcher<string, object, object>
    ) {
        if (RELAY_OPERATION_MAP.has(operationName)) {
            throw new Error(
                \`The relay operation '\${operationName}' is aleary exists, please make sure: \` + 
                "1. Each relay operation is created and saved as constant under GLOBAL scope, " +
                "2. Each relay operation has a unique name"
            );
        }
        this.taggedNode = buildOperation(
            operationType,
            operationName,
            operationField,
            operationAlias,
            operationVariableMap,
            plural,
            fetcher
        );
        RELAY_OPERATION_MAP.set(operationName, this);
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
 *         department\$
 *         .on(DEPARTMENT_FRAGMENT)         
 *     );
 */
export class RelayQuery<TResponse, TVariables> extends RelayOperation<TResponse, TVariables> {

    constructor(
        operationName: string,
        operationField: string,
        operationAlias: string | undefined,
        operationVariableMap: { [key: string]: string },
        plural: boolean,
        fetcher?: Fetcher<string, object, object>
    ) {
        super(
            "query",
            operationName,
            operationField,
            operationAlias,
            operationVariableMap,
            plural,
            fetcher
        );
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
 *         department$\$           
 *     );
 */
export class RelayMutation<TResponse, TVariables> extends RelayOperation<TResponse, TVariables> {

    constructor(
        operationName: string,
        operationField: string,
        operationAlias: string | undefined,
        operationVariableMap: { [key: string]: string },
        plural: boolean,
        fetcher?: Fetcher<string, object, object>
    ) {
        super(
            "mutation",
            operationName,
            operationField,
            operationAlias,
            operationVariableMap,
            plural,
            fetcher
        );
    }
}

/*
 * Example:
 * 
 * export const DEPARTMENT_FRAGMENT =
 *     createTypedFragment(
 *         "DepartmentFragment",
 *         department$\$
 *         .employees(
 *             employee$\$
 *         )           
 *     );
 */
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

export type FragmentKey<T> =
    T extends RelayFragment<infer TFragmentName, string, infer TData, object> ? 
    { readonly " \$data": TData, readonly " \$fragmentRefs": TFragmentName } :
    never
;

const RELAY_OPERATION_MAP = new Map<string, RelayOperation<any, any>>();

const RELAY_FRAGMENT_MAP = new Map<string, RelayFragment<string, string, object, object>>();



////////////////////////////////////////////////////



function buildOperation(
    operationType: "query" | "mutation",
    operationName: string,
    operationField: string,
    operationAlias: string | undefined,
    operationVariableMap: { [key: string]: string },
    plural: boolean,
    fetcher?: Fetcher<string, object, object>
): ConcreteRequest {
    const variableMap = new Map<string, string>();
    for (const variableName in operationVariableMap) {
        variableMap.set(variableName, operationVariableMap[variableName]);
    }
    if (fetcher !== undefined) {
        util.iterateMap(fetcher.explicitVariableMap, ([name, type]) => {
            if (variableMap.has(name) && variableMap.get(name) !== type) {
                throw new Error(\`Conflict types '\${variableMap.get(name)}' and '\${type}' for variable '\${name}'\`);
            }
            variableMap.set(name, type);
        });
        util.iterateMap(fetcher.implicitVariableMap, ([name, type]) => {
            if (variableMap.has(name) && variableMap.get(name) !== type) {
                throw new Error(\`Conflict types '\${variableMap.get(name)}' and '\${type}' for variable '\${name}'\`);
            }
            variableMap.set(name, type);
        });
    }
    const argumentDefinitions: ReaderArgumentDefinition[] = [];
    util.iterateMap(variableMap, ([name, ]) => {
        argumentDefinitions.push({
            kind: "LocalArgument",
            name
        });
    });

    const args: ReaderArgument[] = [];
    util.iterateMap(variableMap, ([name, ]) => {
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
        type: "Query",
        selections: [{
            concreteType: fetcher?.fetchableType?.entityName,
            kind: fetcher !== undefined ? "LinkedField" : "ScalarField",
            name: operationField,
            plural,
            args, 
            alias: operationAlias,
            selections: fetcher !== undefined ? buildSelections(fetcher, false) : []
        }]
    };

    const operation: NormalizationOperation = {
        kind: "Operation",
        name: operationName,
        argumentDefinitions: argumentDefinitions as NormalizationLocalArgumentDefinition[],
        selections: [{
            concreteType: fetcher?.fetchableType?.entityName,
            kind: fetcher !== undefined ? "LinkedField" : "ScalarField",
            name: operationField,
            plural,
            args, 
            alias: operationAlias,
            selections: fetcher !== undefined ? buildSelections(fetcher, true) : []
        } as NormalizationSelection]
    }

    const writer = new TextWriter();
    writer.text(\`\${operationType} \${operationName}\`);
    if (variableMap.size !== 0) {
        writer.scope({type: "ARGUMENTS", multiLines: variableMap.size > 2, suffix: " "}, () => {
            for (const [name, type] of variableMap) {
                writer.seperator();
                writer.text(\`$\${name}: \${type}\`);
            }
        });
    }
    writer.scope({type: "BLOCK", multiLines: true, suffix: "\\n"}, () => {
        if (operationAlias !== undefined && operationAlias !== operationField) {
            writer.text(\`\${operationAlias}: \`);
        }
        writer.text(operationField);
        if (variableMap.size !== 0) {
            writer.scope({type: "ARGUMENTS", multiLines: variableMap.size > 2, suffix: " "}, () => {
                for (const [name, ] of variableMap) {
                    writer.seperator();
                    writer.text(\`\${name}: $\${name}\`);
                }
            });
        }
        if (fetcher !== undefined) {
            writer.text(fetcher.toString());
        }
    });
    if (fetcher !== undefined) {
        writer.text(fetcher.toFragmentString());
    }
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
                alias: undefined,
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
            alias: undefined,
            name: fieldName,
            args: undefined,
            storageKey: undefined
        });
    }
}
`;
