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
const Associations_1 = require("../Associations");
const Generator_1 = require("../Generator");
const ApolloHookWriter_1 = require("./ApolloHookWriter");
class ApolloGenerator extends Generator_1.Generator {
    constructor(config) {
        super(config);
    }
    generateServices(queryFields, mutationFields, promises) {
        return __awaiter(this, void 0, void 0, function* () {
            if (queryFields.length !== 0) {
                promises.push(this.generateQueries(queryFields));
            }
            if (mutationFields.length !== 0) {
                promises.push(this.generateMutations(mutationFields));
            }
            promises.push(this.generateDependencyManager());
        });
    }
    generateQueries(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Queries.ts"));
            new ApolloHookWriter_1.ApolloHookWriter("Query", fields, stream, this.config).write();
            yield stream.end();
        });
    }
    generateMutations(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "Mutations.ts"));
            new ApolloHookWriter_1.ApolloHookWriter("Mutation", fields, stream, this.config).write();
            yield stream.end();
        });
    }
    generateDependencyManager() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = Generator_1.createStreamAndLog(path_1.join(this.config.targetDir, "DependencyManager.tsx"));
            stream.write(DEPENDENCY_MANAGER_CODE);
            yield stream.end();
        });
    }
    writeIndexCode(stream, schema) {
        const _super = Object.create(null, {
            writeIndexCode: { get: () => super.writeIndexCode }
        });
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let hasTypedQuery = false;
            let hasSimpleQuery = false;
            let hasTypedMutation = false;
            let hasSimpleMutation = false;
            const queryFieldMap = (_a = schema.getQueryType()) === null || _a === void 0 ? void 0 : _a.getFields();
            for (const queryFieldName in queryFieldMap) {
                const queryField = queryFieldMap[queryFieldName];
                if (Associations_1.associatedTypeOf(queryField.type) !== undefined) {
                    hasTypedQuery = true;
                }
                else {
                    hasSimpleQuery = true;
                }
                if (hasTypedQuery && hasSimpleQuery) {
                    break;
                }
            }
            const mutationFieldMap = (_b = schema.getMutationType()) === null || _b === void 0 ? void 0 : _b.getFields();
            for (const mutationFieldName in mutationFieldMap) {
                const mutationField = mutationFieldMap[mutationFieldName];
                if (Associations_1.associatedTypeOf(mutationField.type) !== undefined) {
                    hasTypedMutation = true;
                }
                else {
                    hasSimpleMutation = true;
                }
                if (hasTypedMutation && hasSimpleMutation) {
                    break;
                }
            }
            if (hasTypedQuery || hasSimpleQuery) {
                const typedQuery = hasTypedQuery ? "useTypedQuery, useLazyTypedQuery" : "";
                const simpleQuery = hasSimpleQuery ? "useSimpleQuery, useLazySimpleQuery" : "";
                const separator = hasTypedQuery && hasSimpleQuery ? ", " : "";
                stream.write(`export {${typedQuery}${separator}${simpleQuery}} from './Queries';\n`);
            }
            if (hasTypedMutation || hasSimpleMutation) {
                const typedMuation = hasTypedMutation ? "useTypedMutation" : "";
                const simpleMuation = hasSimpleMutation ? "useSimpleMutation" : "";
                const separator = hasTypedMutation && hasSimpleMutation ? ", " : "";
                stream.write(`export {${typedMuation}${separator}${simpleMuation}} from './Mutations';\n`);
            }
            stream.write("export { DependencyManagerProvider, useRefetchQuries } from './DependencyManager';\n");
            stream.write("export type { RefetchQueries } from './DependencyManager';\n");
            _super.writeIndexCode.call(this, stream, schema);
        });
    }
}
exports.ApolloGenerator = ApolloGenerator;
const DEPENDENCY_MANAGER_CODE = `import { createContext, FC, memo, PropsWithChildren, useContext, useMemo } from "react";
import { DependencyManager, DependencyMode, Fetcher } from "graphql-ts-client-api";

export const DependencyManagerProvider: FC<
    PropsWithChildren<{}>
> = memo(({children}) => {
    const dependencyManager = useMemo<DependencyManager>(() => {
        return new DependencyManager();
    }, []);
    return (
        <dependencyManagerContext.Provider value={dependencyManager}>
            {children}
        </dependencyManagerContext.Provider>
    );
});

export function useRefetchQuries() {
    
    const dependencyManager = useContext(dependencyManagerContext);
    
    // This "if statement" does not broken the rules of react-hooks because it throws exception.
    if (dependencyManager === undefined) {
        throw new Error("'useRefetchQuires' can only be used under <DependencyManagerProvider/>.");
    }

    return useMemo<RefetchQueries>(() => {
        const byTypes = (fetcher: Fetcher<string, object>, mode?: DependencyMode, condition?: boolean): string[] => {
            if (condition !== false) {
                return dependencyManager.resourcesDependOnTypes(fetcher, mode ?? "ALL");
            }
            return [];
        };
        const byFields = (fetcher: Fetcher<string, object>, mode?: DependencyMode, condition?: boolean): string[] => {
            if (condition !== false) {
                return dependencyManager.resourcesDependOnFields(fetcher, mode ?? "ALL");
            }
            return [];
        };
        return { byTypes, byFields };
    }, [dependencyManager]);
}

export interface RefetchQueries {
    byTypes(fetcher: Fetcher<string, object>, mode?: DependencyMode, condition?: boolean): string[];
    byFields(fetcher: Fetcher<string, object>, mode?: DependencyMode, condition?: boolean): string[];
}

// Internal, only used by useTypedQuery and useLazyTypedQuery
export const dependencyManagerContext = createContext<DependencyManager | undefined>(undefined);
`;