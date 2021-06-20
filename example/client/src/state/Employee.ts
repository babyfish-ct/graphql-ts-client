import { EmployeeFetchable } from "../generated/fetchers";
import { findEmployees, FindEmployeesArgs } from "../generated/queries";
import { fetchableSelectorFamily } from "./FetchableSelectorFamily";

export const employeeQuery = fetchableSelectorFamily<
    FindEmployeesArgs, 
    EmployeeFetchable
>({
    key: "employeeQuery",
    get: (args, fetcher) => () => {
        return findEmployees(args, fetcher);
    }
});
