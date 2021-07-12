/**
 * @author ChenTao
 * 
 * Client-side of example of 'graphql-ts-client' 
 */

import { findEmployees, FindEmployeesArgs } from "../generated/queries";
import { determineDependencies } from "./common/Dependency";
import { fetchableSelectorFamily } from "./common/FetchableSelectorFamily";

export const selectEmployees = fetchableSelectorFamily.list<
    "Employee", 
    FindEmployeesArgs 
>({
    key: "selectEmployees",
    get: (param, fetcher) => ({get}) => {
        
        determineDependencies(get, fetcher);

        // Please view the invocation of "setGraphQLClient" in '../index.tsx'
        return findEmployees(param, fetcher);
    }
});
