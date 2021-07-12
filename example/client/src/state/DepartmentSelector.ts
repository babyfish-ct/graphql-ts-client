/**
 * @author ChenTao
 * 
 * Client-side of example of 'graphql-ts-client' 
 */

import { findDepartmentsLikeName } from "../generated/queries";
import { determineDependencies } from "./common/Dependency";
import { fetchableSelectorFamily } from "./common/FetchableSelectorFamily";

export const selectDepartmentsLikeName = fetchableSelectorFamily.list<
    "Department",
    string | undefined
>({
    key: "selectDepartmentsLikeName",
    get: (param, fetcher) => ({get}) => {

        determineDependencies(get, fetcher);

        // Please view the invocation of "setGraphQLClient" in '../index.tsx'
        return findDepartmentsLikeName(param, fetcher);
    }
});
