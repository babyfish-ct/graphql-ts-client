export interface GeneratorConfig {
    readonly schemaExtractor: () => Promise<string>;
    readonly targetDir: string;
    readonly recreateTargetDir?: boolean;
    readonly targetNamespace?: string;
    readonly indent?: string;
}
