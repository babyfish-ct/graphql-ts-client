"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerEventWiter = void 0;
const Writer_1 = require("../Writer");
class TriggerEventWiter extends Writer_1.Writer {
    constructor(modelType, idField, stream, config) {
        super(stream, config);
        this.modelType = modelType;
        this.idField = idField;
        const simpleKeys = new Set();
        const parameterizedKeys = new Set();
        const fieldMap = modelType.getFields();
        for (const fieldName in fieldMap) {
            if (fieldName !== (idField === null || idField === void 0 ? void 0 : idField.name)) {
                if (fieldMap[fieldName].args.length === 0) {
                    simpleKeys.add(fieldName);
                }
                else {
                    parameterizedKeys.add(fieldName);
                }
            }
        }
        this.simpleKeys = simpleKeys;
        this.parameterizedKeys = parameterizedKeys;
    }
    prepareImportings() {
        this.importStatement(`import {ImplementationType} from '../CommonTypes';`);
        if (this.parameterizedKeys.size !== 0) {
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
            t(`\nreadonly changedKeys: ReadonlyArray<${this.modelType.name}ChangeEventKey>;\n`);
            for (const prefix of ["old", "new"]) {
                if (this.simpleKeys.size !== 0) {
                    t(`\n${prefix}Value<TKey extends ${this.modelType.name}ChangeEventSimpleKeys>`);
                    this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                        t(`key: TKey`);
                    });
                    t(`: ${this.modelType.name}ChangeEventValues[TKey] | undefined;\n`);
                }
                if (this.parameterizedKeys.size !== 0) {
                    t(`\n${prefix}Value<TKey extends ${this.modelType.name}ChangeEventParameterizedKeys>`);
                    this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                        t(`key: TKey`);
                        this.separator(", ");
                        t(`variables: ${this.modelType.name}Args[TKey]`);
                    });
                    t(`: ${this.modelType.name}ChangeEventValues[TKey] | undefined;\n`);
                }
            }
        });
        this.writeEventKey();
        this.writeEventSimpleKeys();
        this.writeEventParameterizedKeys();
        this.writeEventValues();
    }
    writeEventKey() {
        const t = this.text.bind(this);
        const fieldMap = this.modelType.getFields();
        t(`\nexport type ${this.modelType}ChangeEventKey = `);
        this.scope({ type: "BLANK", multiLines: true, suffix: ";\n" }, () => {
            if (this.simpleKeys.size !== 0) {
                t(`${this.modelType}ChangeEventSimpleKeys`);
            }
            for (const key of this.parameterizedKeys) {
                this.separator(" | ");
                this.scope({ type: "BLOCK", multiLines: true }, () => {
                    t(`readonly name: "${key}";\n`);
                    t(`readonly variables: ${this.modelType.name}Args["${key}"];\n`);
                });
            }
        });
    }
    writeEventSimpleKeys() {
        if (this.simpleKeys.size === 0) {
            return;
        }
        const t = this.text.bind(this);
        t(`\nexport type ${this.modelType}ChangeEventSimpleKeys = `);
        this.scope({ type: "BLANK", multiLines: true, suffix: ";\n" }, () => {
            for (const key of this.simpleKeys) {
                this.separator(" | ");
                t(`"${key}"`);
            }
        });
    }
    writeEventParameterizedKeys() {
        if (this.parameterizedKeys.size === 0) {
            return;
        }
        const t = this.text.bind(this);
        t(`\nexport type ${this.modelType}ChangeEventParameterizedKeys = `);
        this.scope({ type: "BLANK", multiLines: true, suffix: ";\n" }, () => {
            for (const key of this.parameterizedKeys) {
                this.separator(" | ");
                t(`"${key}"`);
            }
        });
    }
    writeEventValues() {
        const t = this.text.bind(this);
        const typeMap = this.modelType.getFields();
        t(`\nexport interface ${this.modelType}ChangeEventValues `);
        this.scope({ type: "BLOCK", multiLines: true, suffix: ";\n" }, () => {
            var _a;
            const typeMap = this.modelType.getFields();
            for (const fieldName in typeMap) {
                if (fieldName !== ((_a = this.idField) === null || _a === void 0 ? void 0 : _a.name)) {
                    t(`${fieldName}: `);
                    this.typeRef(typeMap[fieldName].type, "{readonly id: any}");
                    t(";\n");
                }
            }
        });
    }
}
exports.TriggerEventWiter = TriggerEventWiter;
