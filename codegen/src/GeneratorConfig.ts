export interface GeneratorConfig {
    readonly schemaExtractor: () => Promise<string>,
    readonly targetDir: string;
    readonly recreateTargetDir?: boolean;
    readonly indent?: string;
    readonly modelEditable?: boolean;
    readonly fetcherSuffix?: string;
    readonly generateOperations?: boolean;
}
