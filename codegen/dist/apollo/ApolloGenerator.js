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
exports.ApolloGenerator = void 0;
const path_1 = require("path");
const Generator_1 = require("../Generator");
class ApolloGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    generateServices(_, promises) {
        return __awaiter(this, void 0, void 0, function* () {
            promises.push(this.generateApollo());
            promises.push(this.generateDependencyManager());
        });
    }
    generateApollo() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Apollo.ts"));
            stream.write(APOLLO_CODE);
            yield Generator_1.closeStream(stream);
        });
    }
    generateDependencyManager() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "DependencyManager.tsx"));
            stream.write(DEPENDENCY_MANAGER_CODE);
            yield Generator_1.closeStream(stream);
        });
    }
    writeIndexCode(stream, schema) {
        const _super = Object.create(null, {
            writeIndexCode: { get: () => super.writeIndexCode }
        });
        return __awaiter(this, void 0, void 0, function* () {
            stream.write("export { useTypedQuery, useTypedLazyQuery, useTypedMutation } from './Apollo';\n");
            stream.write("export { DependencyManagerProvider, useDependencyManager } from './DependencyManager';\n");
            yield _super.writeIndexCode.call(this, stream, schema);
        });
    }
}
exports.ApolloGenerator = ApolloGenerator;
const APOLLO_CODE = `import { 
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
		const operationName = options?.operationName ?? \`mutation_\${util.toMd5(body)}\`;
		return gql\`mutation \${operationName}\${body}\`;
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
            writer.text(\`$\${name}: \${type}\`);
        });
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
    PropsWithChildren<{readonly defaultRegisterDependencies?: boolean}>
> = memo(({children, defaultRegisterDependencies = true}) => {
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

// Internal, used by usedTypedQuery, useLazyTypedQuery, useTypedMutation
export const dependencyManagerContext = createContext<[DependencyManager | undefined, DependencyManagerProviderConfig | undefined]>([undefined, undefined]);
`;
