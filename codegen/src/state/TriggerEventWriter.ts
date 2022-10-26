import { WriteStream } from "fs";
import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "../GeneratorConfig";
import { isExecludedTypeName, targetTypeOf } from "../Utils";
import { Writer } from "../Writer";

export class TriggerEventWiter extends Writer {

    private simpleFieldNames: ReadonlySet<string>;

    private parameterizedFieldNames: ReadonlySet<string>;

    constructor(
        private modelType: GraphQLObjectType | GraphQLInterfaceType,
        private idField: GraphQLField<any, any> | undefined,
        stream: WriteStream, 
        config: GeneratorConfig
    ) {
        super(stream, config);

        const simpleFieldNames = new Set<string>();
        const parameterizedFieldNames = new Set<string>();
        const fieldMap = modelType.getFields();
        for (const fieldName in fieldMap) {
            if (fieldName !== idField?.name) {
                const targetTypeName = targetTypeOf(fieldMap[fieldName].type)?.name;
                if (!isExecludedTypeName(config, targetTypeName)) {
                    if (fieldMap[fieldName].args.length === 0) {
                        simpleFieldNames.add(fieldName);
                    } else {
                        parameterizedFieldNames.add(fieldName);
                    }
                }
            }
        }
        this.simpleFieldNames = simpleFieldNames;
        this.parameterizedFieldNames = parameterizedFieldNames;
    }

    protected prepareImportings() {
        this.importStatement(`import {ImplementationType} from '../CommonTypes';`);
        this.importStatement(`import {${
            [
                this.parameterizedFieldNames.size !== 0 ?
                `${this.modelType.name}Args` :
                undefined,
                `${this.modelType.name}FlatType`
            ]
            .filter(text => text !== undefined)
            .join(", ")
        }} from '../fetchers/${this.modelType.name}Fetcher';`);
    }

    protected writeCode() {

        this.writeEvictEvent();
        this.writeChangeEvent();
        this.writeEntityKey();
        this.writeEntityFields();
    }

    private writeEvictEvent() {

        const t = this.text.bind(this);

        t(`\nexport interface ${this.modelType}EvictEvent `);
        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {

            t(`\nreadonly eventType: "evict";\n`);

            t(`\nreadonly typeName: ImplementationType<"${this.modelType.name}">;\n`);

            if (this.idField !== undefined) {
                t(`\nreadonly id: `);
                this.typeRef(this.idField.type);
                t(`;\n`);
            }

            t("\nreadonly causedByGC: boolean;\n");

            t(`\nreadonly evictedType: "row" | "fields";\n`);

            t(`\nreadonly evictedKeys: ReadonlyArray<${this.modelType.name}EntityKey<any>>;\n`);
            t(`\nhas(evictedKey: ${this.modelType.name}EntityKey<any>): boolean;\n`);

            t(`\nevictedValue<TFieldName extends ${this.modelType.name}EntityFields>`);
            this.scope({type: "PARAMETERS", multiLines: true}, () => {
                t(`key: ${this.modelType.name}EntityKey<TFieldName>`);
            });
            t(`: ${this.modelType.name}FlatType[TFieldName] | undefined;\n`);
        });
    }

    private writeChangeEvent() {
        
        const t = this.text.bind(this);

        t(`\nexport interface ${this.modelType}ChangeEvent `);
        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {

            t(`\nreadonly eventType: "change";\n`);

            t(`\nreadonly typeName: ImplementationType<"${this.modelType.name}">;\n`);

            if (this.idField !== undefined) {
                t(`\nreadonly id: `);
                this.typeRef(this.idField.type);
                t(`;\n`);
            }

            if (this.modelType.name !== "Query") {
                t(`\nreadonly changedType: "insert" | "update" | "delete";\n`);
            }

            t(`\nreadonly changedKeys: ReadonlyArray<${this.modelType.name}EntityKey<any>>;\n`);

            t(`\nhas(changedKey: ${this.modelType.name}EntityKey<any>): boolean;\n`);

            for (const prefix of ["old", "new"]) {
                t(`\n${prefix}Value<TFieldName extends ${this.modelType.name}EntityFields>`);
                this.scope({type: "PARAMETERS", multiLines: true}, () => {
                    t(`key: ${this.modelType.name}EntityKey<TFieldName>`);
                });
                t(`: ${this.modelType.name}FlatType[TFieldName] | undefined;\n`);
            }
        });
    }

    private writeEntityKey() {

        const t = this.text.bind(this);

        t(`\nexport type ${this.modelType}EntityKey<TFieldName extends ${this.modelType}EntityFields> = `);
        this.scope({type: "BLANK", multiLines: true, suffix: ";\n"}, () => {
            for (const fieldName of this.parameterizedFieldNames) {
                t(`TFieldName extends "${fieldName}" ? \n`);
                t(`{ readonly name: "${fieldName}"; readonly variables: ${this.modelType.name}Args } : \n`);
            }
            t('TFieldName\n');
        });
    }

    private writeEntityFields() {

        const t = this.text.bind(this);

        t(`\nexport type ${this.modelType}EntityFields = `);
        this.scope({type: "BLANK", multiLines: true, suffix: ";\n"}, () => {
            for (const fieldName of this.simpleFieldNames) {
                this.separator(" | ");
                t(`"${fieldName}"`);
            }
            for (const fieldName of this.parameterizedFieldNames) {
                this.separator(" | ");
                t(`"${fieldName}"`);
            }
        });
    }
}