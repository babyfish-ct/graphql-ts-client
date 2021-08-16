import { createContext, FC, memo, PropsWithChildren, useContext, useMemo } from "react";
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
