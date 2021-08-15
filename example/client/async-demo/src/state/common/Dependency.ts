import { useCallback } from "react";
import { atomFamily, GetRecoilValue, useSetRecoilState } from "recoil";
import { Fetcher } from "graphql-ts-client-api";

export type AbstractModelType = "Department" | "Employee";

export function determineDependencies(
    get: GetRecoilValue,
    fetcher: Fetcher<string, any>
) {
    const fetchedTypeNames = new Set<string>();
    collectTypeNames(fetcher, fetchedTypeNames);
    for (const fetchedTypeName of fetchedTypeNames) {
        get(requestIdFamily(fetchedTypeName));
    }
}

export function useReferesher(
    modelType: AbstractModelType
) {
    const set = useSetRecoilState(requestIdFamily(modelType));
    return useCallback(() => {
        set(cur => cur + 1);
    }, [set]);
}

const requestIdFamily = atomFamily<number, string>({
    key: "requestIdFamily",
    default: 0
});

function collectTypeNames(
    fetcher: Fetcher<string, any>, 
    outputSet: Set<string>
) {
    outputSet.add(fetcher.fetchedEntityType);
    for (const [, field] of fetcher.fieldMap) {
        if (field.childFetchers !== undefined) {
            for (const child of field.childFetchers) {
                collectTypeNames(child, outputSet);
            }
        }
    }
}