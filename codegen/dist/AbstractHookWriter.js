"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractHookWriter = void 0;
const Associations_1 = require("./Associations");
const Writer_1 = require("./Writer");
class AbstractHookWriter extends Writer_1.Writer {
    constructor(hookType, fields, stream, config) {
        super(stream, config);
        this.hookType = hookType;
        this.fields = fields;
        this.hasTypedHooks = this.fields.find(field => Associations_1.associatedTypeOf(field.type) !== undefined) !== undefined;
        this.hasSimpleHooks = this.fields.find(field => Associations_1.associatedTypeOf(field.type) === undefined) !== undefined;
    }
    writeVariables() {
        const t = this.text.bind(this);
        t(`\nexport interface ${this.hookType}Variables`);
        this.scope({ "type": "BLOCK", multiLines: true, suffix: "\n" }, () => {
            for (const field of this.fields) {
                t(field.name);
                t(": ");
                this.scope({ "type": "BLOCK", multiLines: field.args.length > 2 }, () => {
                    for (const arg of field.args) {
                        this.separator(", ");
                        t("readonly ");
                        this.varableDecl(arg.name, arg.type);
                    }
                });
                t(";\n");
            }
        });
    }
    writeFetchableTypes() {
        const t = this.text.bind(this);
        t("\nexport interface ");
        t(this.hookType);
        t("FetchableTypes ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
            for (const field of this.fields) {
                const associatedType = Associations_1.associatedTypeOf(field.type);
                if (associatedType !== undefined) {
                    t(field.name);
                    t(": '");
                    t(associatedType.name);
                    t("';\n");
                }
            }
        });
    }
    writeFetchedTypes() {
        const t = this.text.bind(this);
        t("\nexport interface ");
        t(this.hookType);
        t("FetchedTypes<T> ");
        this.scope({ "type": "BLOCK", multiLines: true, suffix: "\n" }, () => {
            for (const field of this.fields) {
                const associatedType = Associations_1.associatedTypeOf(field.type);
                if (associatedType !== undefined) {
                    this.varableDecl(field.name, field.type, "T");
                    t(";\n");
                }
            }
        });
    }
    writeSimpleTypes() {
        const t = this.text.bind(this);
        t("\nexport interface ");
        t(this.hookType);
        t("SimpleTypes ");
        this.scope({ "type": "BLOCK", multiLines: true, suffix: "\n" }, () => {
            for (const field of this.fields) {
                const associatedType = Associations_1.associatedTypeOf(field.type);
                if (associatedType === undefined) {
                    this.varableDecl(field.name, field.type);
                    t(";\n");
                }
            }
        });
    }
    writeGQLParameters() {
        const t = this.text.bind(this);
        t("\nconst GQL_PARAMS: {[key: string]: string} = ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: ";\n" }, () => {
            for (const field of this.fields) {
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t(`"${field.name}": `);
                    this.scope({ type: "BLANK", prefix: '"(', suffix: ')"' }, () => {
                        for (const arg of field.args) {
                            this.separator(", ");
                            t("$");
                            t(arg.name);
                            t(": ");
                            this.gqlTypeRef(arg.type);
                        }
                    });
                }
            }
        });
    }
    writeGQLArguments() {
        const t = this.text.bind(this);
        t("\nconst GQL_ARGS: {[key: string]: string} = ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: ";\n" }, () => {
            for (const field of this.fields) {
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t(`"${field.name}": `);
                    this.scope({ type: "BLANK", prefix: '"(', suffix: ')"' }, () => {
                        for (const arg of field.args) {
                            this.separator(", ");
                            t(arg.name);
                            t(": ");
                            t("$");
                            t(arg.name);
                        }
                    });
                }
            }
        });
    }
}
exports.AbstractHookWriter = AbstractHookWriter;
