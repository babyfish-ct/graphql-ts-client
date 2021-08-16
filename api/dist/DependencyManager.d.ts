import { Fetcher } from "./Fetcher";
export declare class DependencyManager {
    private directMap;
    private indirectMap;
    register(resource: string, fetchers: Fetcher<string, object>[]): void;
    unregister(resource: string): void;
    resourcesDependOnTypes(fetcher: Fetcher<string, object>, mode?: DependencyMode): string[];
    resourcesDependOnFields(fetcher: Fetcher<string, object>, mode?: DependencyMode): string[];
    private register0;
    private register1;
    private unregister0;
    private resourcesDependOnTypes0;
    private resourcesDependOnFields0;
}
export declare type DependencyMode = "DIRECT" | "INDIRECT" | "ALL";
