"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumInputMetadataBuilder = void 0;
class EnumInputMetadataBuilder {
    constructor() {
        this.typeMap = new Map();
    }
    add(name, fields) {
        this.typeMap.set(name, fields);
        return this;
    }
    build() {
        const target = new EnumInputMetadataImpl();
        this.target = target;
        for (const name of this.typeMap.keys()) {
            this.toMetdata(name);
        }
        this.target = undefined;
        return target;
    }
    toMetdata(name) {
        const metadata = this.target;
        let metatype = metadata.metatypeMap.get(name);
        if (metatype !== undefined) {
            return metatype;
        }
        if (!this.typeMap.has(name)) {
            throw new Error(`Illegal enum metatype type name '${name}'`);
        }
        const rawFields = this.typeMap.get(name);
        let fields;
        if (rawFields === undefined) {
            fields = undefined;
        }
        else {
            fields = new Map();
            for (const { name: fieldName, typeName } of rawFields) {
                fields.set(fieldName, this.toMetdata(typeName));
            }
        }
        metatype = {
            type: rawFields === undefined ? "ENUM" : "INPUT",
            name,
            fields,
            metadata
        };
        metadata.metatypeMap.set(name, metatype);
        return metatype;
    }
}
exports.EnumInputMetadataBuilder = EnumInputMetadataBuilder;
class EnumInputMetadataImpl {
    constructor() {
        this.metatypeMap = new Map();
    }
    getType(name) {
        return this.metatypeMap.get(name);
    }
}
