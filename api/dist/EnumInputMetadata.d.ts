export interface EnumInputMetadata {
    getType(name: string): EnumInputMetaType | undefined;
}
export interface EnumInputMetaType {
    readonly type: "ENUM" | "INPUT";
    readonly name: string;
    readonly fields?: ReadonlyMap<string, EnumInputMetaType>;
    readonly metadata: EnumInputMetadata;
}
export declare class EnumInputMetadataBuilder {
    private typeMap;
    private target?;
    add(name: string, fields?: ReadonlyArray<RawField>): this;
    build(): EnumInputMetadata;
    private toMetdata;
}
interface RawField {
    readonly name: string;
    readonly typeName: string;
}
export {};
