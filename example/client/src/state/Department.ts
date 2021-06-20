import { DepartmentFetchable } from "../generated/fetchers";
import { findDepartmentsLikeName } from "../generated/queries";
import { fetchableSelectorFamily } from "./FetchableSelectorFamily";

export const selectDepartmentsLikeName = fetchableSelectorFamily.list<
    DepartmentFetchable,
    string | undefined
>({
    key: "selectDepartmentsLikeName",
    get: (param, fetcher) => () => {
        return findDepartmentsLikeName(param, fetcher);
    }
});