export interface EnumInputMetadata {
    getType(name: string): EnumInputMetaType | undefined;
}

export interface EnumInputMetaType {
    readonly type: "ENUM" | "INPUT";
    readonly name: string;
    readonly fields?: ReadonlyMap<string, EnumInputMetaType>;
    readonly metadata: EnumInputMetadata;
}

export class EnumInputMetadataBuilder {

    private typeMap = new Map<string, ReadonlyArray<RawField> | undefined>();

    private target?: EnumInputMetadataImpl;

    add(
        name: string, 
        fields?: ReadonlyArray<RawField>
    ): this {
        this.typeMap.set(name, fields);
        return this;
    }

    build(): EnumInputMetadata {
        const target = new EnumInputMetadataImpl();
        this.target = target;
        for (const name of this.typeMap.keys()) {
            this.toMetdata(name);
        }
        this.target = undefined;
        return target;
    }

    private toMetdata(name: string): EnumInputMetaType {
        const metadata = this.target!!;
        let metatype = metadata.metatypeMap.get(name);
        if (metatype !== undefined) {
            return metatype;
        }
        if (!this.typeMap.has(name)) {
            throw new Error(`Illegal enum metatype type name '${name}'`);
        }
        const rawFields = this.typeMap.get(name);
        let fields: Map<string, EnumInputMetaType> | undefined;
        if (rawFields === undefined) {
            fields = undefined;
        } else {
            fields = new Map<string, EnumInputMetaType>();
            for (const { name: fieldName, typeName } of rawFields) {
                fields.set(fieldName, this.toMetdata(typeName));
            }
        }
        metatype = {
            type: rawFields === undefined ? "ENUM" : "INPUT",
            name,
            fields,
            metadata
        }
        metadata.metatypeMap.set(name, metatype);
        return metatype;
    }
}

class EnumInputMetadataImpl implements EnumInputMetadata {

    readonly metatypeMap = new Map<String, EnumInputMetaType>();

    getType(name: string): EnumInputMetaType | undefined {
        return this.metatypeMap.get(name);
    }
}

interface RawField {
    readonly name: string;
    readonly typeName: string;
}