/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { WriteStream } from "fs";
import { GraphQLField, GraphQLSchema } from "graphql";
import { join } from "path";
import { associatedTypeOf } from "../Utils";
import { awaitStream, createStreamAndLog, Generator } from "../Generator";
import { GeneratorConfig } from "../GeneratorConfig";

export class ApolloGenerator extends Generator {
    
    constructor(config: GeneratorConfig) {
        super(config);
    }

    protected async generateServices(_: GraphQLSchema, promises: Promise<void>[]) {
        promises.push(this.generateApollo());
        promises.push(this.generateDependencyManager());
    }

    private async generateApollo() {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "DependencyManager.tsx")
        );
        stream.write(DEPENDENCY_MANAGER_CODE);
        await awaitStream(stream);
    }

    private async generateDependencyManager() {
        const stream = createStreamAndLog(
            join(this.config.targetDir, "DependencyManager.tsx")
        );
        stream.write(DEPENDENCY_MANAGER_CODE);
        await awaitStream(stream);
    }

    protected async writeIndexCode(stream: WriteStream, schema: GraphQLSchema) {
        
        stream.write("export { useTypedQuery, useTypedLazyQuery, useTypedMutation } from './Apollo';");
        stream.write("export { DependencyManagerProvider } from './DependencyManager';\n");
        stream.write("export type { RefetchableDependencies } from './DependencyManager';\n");

        super.writeIndexCode(stream, schema);
    }
}

const APOLLO_CODE = `import { 
    useQuery,
    useLazyQuery, 
    useMutation, 
    gql,
    ApolloCache, 
    DefaultContext, 
    DocumentNode, 
    FetchResult, 
    InternalRefetchQueriesInclude, 
    MutationHookOptions, 
    MutationTuple, 
    QueryHookOptions, 
    QueryResult, 
    QueryTuple 
} from "@apollo/client";
import { Fetcher, TextWriter, util } from "graphql-ts-client-api";
import { useContext, useEffect, useMemo } from "react";
import { dependencyManagerContext, RefetchableDependencies } from "./DependencyManager";

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
		const operationName = options?.operationName ?? \`query_\${util.toMd5(body)}\`;
		return [operationName, gql\`query \${operationName}\${body}\`];
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
		const operationName = options?.operationName ?? \`query_\${util.toMd5(body)}\`;
		return [operationName, gql\`query \${operationName}\${body}\`];
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
        readonly operationName?: string,
		readonly refetchDependencies?: (
			result: FetchResult<TData> &{ dependencies: RefetchableDependencies<TData> }
		) => InternalRefetchQueriesInclude
	}
): MutationTuple<
    TData, 
    TVariables, 
    TContext, 
    TCache
> {
    const body = requestBody(fetcher);

    const request = useMemo<DocumentNode>(() => {
		const operationName = options?.operationName ?? \`mutation_\${util.toMd5(body)}\`;
		return gql\`mutation \${operationName}\${body}\`;
	}, [body, options?.operationName]);

	const [dependencyManager] = useContext(dependencyManagerContext);
	if (options?.refetchDependencies && dependencyManager === undefined) {
		throw new Error("The property 'refetchDependencies' of options requires <DependencyManagerProvider/>");
	}
    const dependencies = useMemo<RefetchableDependencies<TData>>(() => {
		const ofData = (oldData: TData | null | undefined, newData?: TData | null | undefined): string[] => {
			return dependencyManager!.resources(fetcher, oldData, newData);
		};
		const ofError = (): string[] => {
			return dependencyManager!.allResources(fetcher);
		};
		return { ofData, ofError };
		// eslint-disable-next-line
	}, [dependencyManager, request]); // Eslint disable is required becasue 'fetcher' is replaced by 'request' here.
	if (options?.refetchDependencies && options?.refetchQueries) {
		throw new Error("The property 'refetchDependencies' and 'refetchQueries' of options cannot be specified at the same time");
	}
	const newOptions = useMemo<
        MutationHookOptions<TData, TVariables, TContext> | 
        undefined
    >(() => {
		const refetchDependencies = options?.refetchDependencies;
		if (refetchDependencies === undefined) {
			return options;
		}
		const cloned: MutationHookOptions<TData, TVariables, TContext> = { ...options };
		cloned.refetchQueries = result => {
			return refetchDependencies({...result, dependencies});
		}
		return cloned;
	}, [options, dependencies]);
	const response = useMutation<
		TData, 
		TVariables, 
		TContext, 
		TCache
	>(request, newOptions);
	const responseData = response[1].data;
	const newResponseData = useMemo(() => util.exceptNullValues(responseData), [responseData]);
	return newResponseData === responseData ? response : util.produce(response, draft => {
		draft[1].data = util.produce(newResponseData, () => {});
	});
}

function requestBody(fetcher: Fetcher<string, object, object>): string {
    const writer = new TextWriter();
    writer.scope({type: "ARGUMENTS", multiLines: fetcher.variableTypeMap.size > 2, suffix: " "}, () => {
        for (const [name, type] of fetcher.variableTypeMap) {
            writer.seperator();
            writer.text(\`$\${name}: \${type}\`);
        }
    });
    writer.text(fetcher.toString());
    writer.text("\\n");
    writer.text(fetcher.toFragmentString());
    return writer.toString();
}
`;

const DEPENDENCY_MANAGER_CODE = `import { createContext, FC, memo, PropsWithChildren, useMemo, useContext } from "react";
import { DependencyManager } from "graphql-ts-client-api";

export const DependencyManagerProvider: FC<
    PropsWithChildren<DependencyManagerProviderConfig>
> = memo(({children, defaultRegisterDependencies}) => {
    const arr = useMemo<[DependencyManager, DependencyManagerProviderConfig]>(() => {
        return [
            new DependencyManager(),
            { defaultRegisterDependencies } 
        ];
    }, [defaultRegisterDependencies]);
    return (
        <dependencyManagerContext.Provider value={arr}>
            {children}
        </dependencyManagerContext.Provider>
    );
});

export function useDependencyManager(): DependencyManager {
    const dependencyManager = useContext(dependencyManagerContext)[0];
    if (dependencyManager === undefined) {
        throw new Error("'useDependencyManager()' can only be used under <DependencyManagerProvider/>");
    }
    return dependencyManager;
}

export interface DependencyManagerProviderConfig {
    defaultRegisterDependencies: boolean;
}

export interface RefetchableDependencies<T extends object> {
    ofData(oldData: T | null | undefined, newData: T | null | undefined): string[];
    ofError(): string[];
}

// Internal, used by usedTypedQuery, useLazyTypedQuery, useTypedMutation
export const dependencyManagerContext = createContext<[DependencyManager | undefined, DependencyManagerProviderConfig | undefined]>([undefined, undefined]);
`;