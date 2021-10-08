"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerEventWiter = void 0;
const Utils_1 = require("../Utils");
const Writer_1 = require("../Writer");
class TriggerEventWiter extends Writer_1.Writer {
    constructor(modelType, idField, stream, config) {
        super(stream, config);
        this.modelType = modelType;
        this.idField = idField;
        const simpleFieldNames = new Set();
        const parameterizedFieldNames = new Set();
        const fieldMap = modelType.getFields();
        for (const fieldName in fieldMap) {
            if (fieldName !== (idField === null || idField === void 0 ? void 0 : idField.name)) {
                if (fieldMap[fieldName].args.length === 0) {
                    simpleFieldNames.add(fieldName);
                }
                else {
                    parameterizedFieldNames.add(fieldName);
                }
            }
        }
        this.simpleFieldNames = simpleFieldNames;
        this.parameterizedFieldNames = parameterizedFieldNames;
    }
    prepareImportings() {
        this.importStatement(`import {ImplementationType} from '../CommonTypes';`);
        if (this.parameterizedFieldNames.size !== 0) {
            this.importStatement(`import {${this.modelType.name}Args} from '../fetchers/${this.modelType.name}Fetcher';`);
        }
    }
    writeCode() {
        const t = this.text.bind(this);
        t(`export interface ${this.modelType}ChangeEvent `);
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
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
                    this.scope({ type: "PARAMETERS", multiLines: true }, () => {
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
    writeEventKey() {
        const t = this.text.bind(this);
        t(`\nexport type ${this.modelType}ChangeEventKey<TFieldName extends ${this.modelType}ChangeEventFields> = `);
        this.scope({ type: "BLANK", multiLines: true, suffix: ";\n" }, () => {
            for (const fieldName of this.parameterizedFieldNames) {
                t(`TFieldName extends "${fieldName}" ? \n`);
                t(`{ readonly name: "${fieldName}"; readonly variables: ${this.modelType.name}Args } : \n`);
            }
            t('TFieldName\n');
        });
    }
    writeEventFieldNames() {
        const t = this.text.bind(this);
        const fieldMap = this.modelType.getFields();
        t(`\nexport type ${this.modelType}ChangeEventFields = `);
        this.scope({ type: "BLANK", multiLines: true, suffix: ";\n" }, () => {
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
    writeEventValues() {
        const t = this.text.bind(this);
        t(`\nexport interface ${this.modelType}ChangeEventValues `);
        this.scope({ type: "BLOCK", multiLines: true, suffix: ";\n" }, () => {
            var _a;
            const typeMap = this.modelType.getFields();
            for (const fieldName in typeMap) {
                if (fieldName !== ((_a = this.idField) === null || _a === void 0 ? void 0 : _a.name)) {
                    const associatedType = Utils_1.associatedTypeOf(typeMap[fieldName].type);
                    t(`readonly ${fieldName}: `);
                    this.typeRef(typeMap[fieldName].type, (type, field) => {
                        var _a, _b;
                        if (type === associatedType) {
                            const fieldMap = type.getFields();
                            const idFieldName = this.config.idFieldMap !== undefined ?
                                (_a = this.config.idFieldMap[type.name]) !== null && _a !== void 0 ? _a : "id" :
                                "id";
                            return field.name === ((_b = fieldMap[idFieldName]) === null || _b === void 0 ? void 0 : _b.name);
                        }
                        return true;
                    });
                    t(";\n");
                }
            }
        });
    }
}
exports.TriggerEventWiter = TriggerEventWiter;
