import { GeneratorConfig } from "./GeneratorConfig";
export declare class Generator {
    private config;
    constructor(config: GeneratorConfig);
    generate(): Promise<void>;
    private loadSchema;
    private generateFetcherTypes;
    private generateInputTypes;
    private generateEnumTypes;
    private generateGraphQLClient;
    private generateOperations;
    private writeSimpleIndex;
    private rmdirIfNecessary;
    private mkdirIfNecessary;
    private objFields;
}
