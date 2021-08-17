/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
import { Fetcher } from "./Fetcher";
export declare class DependencyManager {
    private rootTypeResourceMap;
    private fieldResourceMap;
    private _idGetter;
    constructor(idGetter?: (obj: any) => any);
    register(resource: string, fetcher: Fetcher<string, object>, fieldDependencies?: readonly Fetcher<string, object>[]): void;
    unregister(resource: string): void;
    resources<T extends object>(fetcher: Fetcher<string, T>, oldObject: T | undefined, newObject: T | undefined): string[];
    allResources(fetcher: Fetcher<string, any>): string[];
    private registerTypes;
    private registerFields;
    private collectResources;
    private collectResourcesByAssocaiton;
    private collectAllResources;
}
