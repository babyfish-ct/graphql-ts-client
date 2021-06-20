import { useCallback } from "react";
import { atom, useSetRecoilState } from "recoil";
import { EmployeeFetchable } from "../generated/fetchers";
import { findEmployees, FindEmployeesArgs } from "../generated/queries";
import { fetchableSelectorFamily } from "./FetchableSelectorFamily";

export const selectEmployees = fetchableSelectorFamily.list<
    EmployeeFetchable, 
    FindEmployeesArgs 
>({
    key: "selectEmployees",
    get: (param, fetcher) => ({get}) => {
        get(selectEmployeesRequestId);
        return findEmployees(param, fetcher);
    }
});

export function useRefresherForSelectEmployees(): () => void {
    const set = useSetRecoilState(selectEmployeesRequestId);
    return useCallback(() => { 
        set(old => old + 1) 
    }, [set]);
}

const selectEmployeesRequestId = atom({
    key: "selectEmployeesRequestId",
    default: 0
});
