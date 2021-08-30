import { 
    useQuery,
    useLazyQuery, 
    useMutation, 
    gql,
    ApolloCache, 
    DefaultContext, 
    DocumentNode, 
    MutationHookOptions, 
    MutationTuple, 
    QueryHookOptions, 
    QueryResult, 
    QueryTuple 
} from "@apollo/client";
import { Fetcher, TextWriter, util } from "graphql-ts-client-api";
import { useContext, useEffect, useMemo } from "react";
import { dependencyManagerContext } from "./DependencyManager";

export function useTypedQuery<
    TData extends object,
    TVariables extends object
>( 
    fetcher: Fetcher<"Query", TData, TVariables>,
    options?: QueryHookOptions<TData, TVariables> & {
        readonly operationName?: string,
		readonly registerDependencies?: boolean | { readonly fieldDependencies: readonly Fetcher<string, object, object>[] }
	}
) : QueryResult<TData, TVariables> {

    const body = requestBody(fetcher);

	const [operationName, request] = useMemo<[string, DocumentNode]>(() => {
		const operationName = options?.operationName ?? `query_${util.toMd5(body)}`;
		return [operationName, gql`query ${operationName}${body}`];
	}, [body, options?.operationName]);

	const [dependencyManager, config] = useContext(dependencyManagerContext);
	const register = options?.registerDependencies !== undefined ? !!options.registerDependencies : config?.defaultRegisterDependencies ?? false;
	if (register && dependencyManager === undefined) {
		throw new Error("The property 'registerDependencies' of options requires <DependencyManagerProvider/>");
	}
	useEffect(() => {
		if (register) {
			dependencyManager!.register(
				operationName, 
				fetcher, 
				typeof options?.registerDependencies === 'object' ? options?.registerDependencies?.fieldDependencies : undefined
			);
			return () => { dependencyManager!.unregister(operationName); };
		}// eslint-disable-next-line
	}, [register, dependencyManager, operationName, options?.registerDependencies, request]); // Eslint disable is required, becasue 'fetcher' is replaced by 'request' here.
	const response = useQuery<TData, TVariables>(request, options);
	const responseData = response.data;
	const newResponseData = useMemo(() => util.exceptNullValues(responseData), [responseData]);
	return newResponseData === responseData ? response : util.produce(response, draft => {
		draft.data = util.produce(newResponseData, () => {});
	});
}

export function useTypedLazyQuery<
    TData extends object,
    TVariables extends object
>( 
    fetcher: Fetcher<"Query", TData, TVariables>,
    options?: QueryHookOptions<TData, TVariables> & {
        readonly operationName?: string,
		readonly registerDependencies?: boolean | { readonly fieldDependencies: readonly Fetcher<string, object, object>[] }
	}
) : QueryTuple<TData, TVariables> {

    const body = requestBody(fetcher);

	const [operationName, request] = useMemo<[string, DocumentNode]>(() => {
		const operationName = options?.operationName ?? `query_${util.toMd5(body)}`;
		return [operationName, gql`query ${operationName}${body}`];
	}, [body, options?.operationName]);

	const [dependencyManager, config] = useContext(dependencyManagerContext);
	const register = options?.registerDependencies !== undefined ? !!options.registerDependencies : config?.defaultRegisterDependencies ?? false;
	if (register && dependencyManager === undefined) {
		throw new Error("The property 'registerDependencies' of options requires <DependencyManagerProvider/>");
	}
	useEffect(() => {
		if (register) {
			dependencyManager!.register(
				operationName, 
				fetcher, 
				typeof options?.registerDependencies === 'object' ? options?.registerDependencies?.fieldDependencies : undefined
			);
			return () => { dependencyManager!.unregister(operationName); };
		}// eslint-disable-next-line
	}, [register, dependencyManager, operationName, options?.registerDependencies, request]); // Eslint disable is required, becasue 'fetcher' is replaced by 'request' here.
	const response = useLazyQuery<TData, TVariables>(request, options);
	const responseData = response[1].data;
	const newResponseData = useMemo(() => util.exceptNullValues(responseData), [responseData]);
	return newResponseData === responseData ? response : util.produce(response, draft => {
		draft[1].data = util.produce(newResponseData, () => {});
	});
}

export function useTypedMutation<
    TData extends object,
    TVariables extends object,
    TContext = DefaultContext, 
	TCache extends ApolloCache<any> = ApolloCache<any>
>(
    fetcher: Fetcher<"Mutation", TData, TVariables>,
    options?: MutationHookOptions<TData, TVariables, TContext> & {
        readonly operationName?: string
	}
): MutationTuple<
    TData, 
    TVariables, 
    TContext, 
    TCache
> {
    const body = requestBody(fetcher);

    const request = useMemo<DocumentNode>(() => {
		const operationName = options?.operationName ?? `mutation_${util.toMd5(body)}`;
		return gql`mutation ${operationName}${body}`;
	}, [body, options?.operationName]);

	const response = useMutation<
		TData, 
		TVariables, 
		TContext, 
		TCache
	>(request, options);
	const responseData = response[1].data;
	const newResponseData = useMemo(() => util.exceptNullValues(responseData), [responseData]);
	return newResponseData === responseData ? response : util.produce(response, draft => {
		draft[1].data = util.produce(newResponseData, () => {});
	});
}

function requestBody(fetcher: Fetcher<string, object, object>): string {
    const writer = new TextWriter();
    writer.scope({type: "ARGUMENTS", multiLines: fetcher.variableTypeMap.size > 2, suffix: " "}, () => {
        util.iterateMap(fetcher.variableTypeMap, ([name, type]) => {
            writer.seperator();
            writer.text(`$${name}: ${type}`);
        });
    });
    writer.text(fetcher.toString());
    writer.text("\n");
    writer.text(fetcher.toFragmentString());
    return writer.toString();
}
