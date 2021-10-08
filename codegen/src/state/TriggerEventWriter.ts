import { timeStamp } from "console";
import { WriteStream } from "fs";
import { assertObjectType, GraphQLField, GraphQLInterfaceType, GraphQLObjectType } from "graphql";
import { GeneratorConfig } from "../GeneratorConfig";
import { associatedTypeOf } from "../Utils";
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
                if (fieldMap[fieldName].args.length === 0) {
                    simpleFieldNames.add(fieldName);
                } else {
                    parameterizedFieldNames.add(fieldName);
                }
            }
        }
        this.simpleFieldNames = simpleFieldNames;
        this.parameterizedFieldNames = parameterizedFieldNames;
    }

    protected prepareImportings() {
        this.importStatement(`import {ImplementationType} from '../CommonTypes';`);
        if (this.parameterizedFieldNames.size !== 0) {
            this.importStatement(`import {${this.modelType.name}Args} from '../fetchers/${this.modelType.name}Fetcher';`);
        }
    }

    protected writeCode() {

        const t = this.text.bind(this);

        t(`export interface ${this.modelType}ChangeEvent `);
        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {

            t(`\nreadonly typeName: ImplementationType<"${this.modelType.name}">;\n`);

            if (this.idField !== undefined) {
                t(`\n readonly id: `);
                this.typeRef(this.idField.type);
                t(`;\n`);
            }

            if (this.modelType.name !== "Query") {
                t(`\nreadonly changedType: "INSERT" | "UPDATE" | "DELETE";\n`);
            }

            t(`\nreadonly changedKeys: ReadonlyArray<${this.modelType.name}ChangeEventKey<any>>;\n`);

            for (const prefix of ["old", "new"]) {
                if (this.simpleFieldNames.size !== 0) {
                    t(`\n${prefix}Value<TFieldName extends ${this.modelType.name}ChangeEventFields>`);
                    this.scope({type: "PARAMETERS", multiLines: true}, () => {
                        t(`key: ${this.modelType.name}ChangeEventKey<TFieldName>`);
                    });
                    t(`: ${this.modelType.name}ChangeEventValues[TFieldName] | undefined;\n`);
                }
            }
        });

        this.writeEventKey();
        this.writeEventFieldNames();
        this.writeEventValues();
    }

    private writeEventKey() {

        const t = this.text.bind(this);

        t(`\nexport type ${this.modelType}ChangeEventKey<TFieldName extends ${this.modelType}ChangeEventFields> = `);
        this.scope({type: "BLANK", multiLines: true, suffix: ";\n"}, () => {
            for (const fieldName of this.parameterizedFieldNames) {
                t(`TFieldName extends "${fieldName}" ? \n`);
                t(`{ readonly name: "${fieldName}"; readonly variables: ${this.modelType.name}Args } : \n`);
            }
            t('TFieldName\n');
        });
    }

    private writeEventFieldNames() {

        const t = this.text.bind(this);

        const fieldMap = this.modelType.getFields();

        t(`\nexport type ${this.modelType}ChangeEventFields = `);
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

    private writeEventValues() {

        const t = this.text.bind(this);

        t(`\nexport interface ${this.modelType}ChangeEventValues `);
        this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
            const typeMap = this.modelType.getFields();
            for (const fieldName in typeMap) {
                if (fieldName !== this.idField?.name) {
                    const associatedType = associatedTypeOf(typeMap[fieldName].type);
                    t(`readonly ${fieldName}: `);
                    this.typeRef(typeMap[fieldName].type, (type, field) => {
                        if (type === associatedType) {
                            const fieldMap = type.getFields();
                            const idFieldName = this.config.idFieldMap !== undefined ?
                                this.config.idFieldMap[type.name] ?? "id" :
                                "id";
                            return field.name === fieldMap[idFieldName]?.name;
                        }
                        return true;
                    });
                    t(";\n");
                }
            }
        });
    }
}