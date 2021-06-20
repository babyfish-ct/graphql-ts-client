import { EmployeeFetchable } from "../generated/fetchers";
import { findEmployees, FindEmployeesArgs } from "../generated/queries";
import { fetchableSelectorFamily } from "./FetchableSelectorFamily";

export const selectEmployees = fetchableSelectorFamily.list<
    EmployeeFetchable, 
    FindEmployeesArgs 
>({
    key: "selectEmployees",
    get: (param, fetcher) => () => {
        return findEmployees(param, fetcher);
    }
});
