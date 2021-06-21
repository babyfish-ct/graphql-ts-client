/**
 * @author ChenTao
 * 
 * Client-side of example of 'graphql-ts-client' 
 */

import { DepartmentFetchable } from "../generated/fetchers";
import { findDepartmentsLikeName } from "../generated/queries";
import { fetchableSelectorFamily } from "./FetchableSelectorFamily";

export const selectDepartmentsLikeName = fetchableSelectorFamily.list<
    DepartmentFetchable,
    string | undefined
>({
    key: "selectDepartmentsLikeName",
    get: (param, fetcher) => () => {

        // Please view the invocation of "setGraphQLClient" in '../../index.tsx'
        return findDepartmentsLikeName(param, fetcher);
    }
});
