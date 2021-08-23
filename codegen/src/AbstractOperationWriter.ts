import { WriteStream } from "fs";
import { GraphQLField } from "graphql";
import { associatedTypeOf } from "./Associations";
import { GeneratorConfig } from "./GeneratorConfig";
import { Writer } from "./Writer";

export abstract class AbstractHookWriter extends Writer {

    protected readonly hasTypedHooks: boolean;

    protected readonly hasSimpleHooks: boolean;

    protected isUnderGlobalDir() {
        return true;
    }

    protected constructor(
        protected operationType: "Query" | "Mutation",
        protected fields: GraphQLField<unknown, unknown>[],
        stream: WriteStream, 
        config: GeneratorConfig
    ) {
        super(stream, config);
        this.hasTypedHooks = this.fields.find(field => associatedTypeOf(field.type) !== undefined) !== undefined;
        this.hasSimpleHooks = this.fields.find(field => associatedTypeOf(field.type) === undefined) !== undefined;
    }

    protected prepareImportings() {
        for (const field of this.fields) {
            for (const arg of field.args) {
                this.importType(arg.type);
            }
            if (associatedTypeOf(field.type) === undefined) {
                this.importType(field.type);
            }
        }
    }

    protected writeVariables() {

        const t = this.text.bind(this);

        t(`\nexport interface ${this.operationType}Variables`);
        this.scope({"type": "BLOCK", multiLines: true, suffix: "\n"}, () => {
            for (const field of this.fields) {
                t(field.name);
                t(": ");
                this.scope({"type": "BLOCK", multiLines: field.args.length > 2}, () => {
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

    protected writeFetchableTypes() {
        
        const t = this.text.bind(this);

        t("\nexport interface ");
        t(this.operationType);
        t("FetchableTypes ");
        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
            for (const field of this.fields) {
                const associatedType = associatedTypeOf(field.type);
                if (associatedType !== undefined) {
                    t(field.name);
                    t(": '");
                    t(associatedType.name);
                    t("';\n");
                }
            }
        });
    }

    protected writeFetchedTypes() {

        const t = this.text.bind(this);

        t("\nexport interface ");
        t(this.operationType);
        t("FetchedTypes<T> ")
        this.scope({"type": "BLOCK", multiLines: true, suffix: "\n"}, () => {
            for (const field of this.fields) {
                const associatedType = associatedTypeOf(field.type);
                if (associatedType !== undefined) {
                    this.varableDecl(field.name, field.type, "T");
                    t(";\n");
                }
            }
        });
    }

    protected writeSimpleTypes() {
        
        const t = this.text.bind(this);

        t("\nexport interface ");
        t(this.operationType);
        t("SimpleTypes ")
        this.scope({"type": "BLOCK", multiLines: true, suffix: "\n"}, () => {
            for (const field of this.fields) {
                const associatedType = associatedTypeOf(field.type);
                if (associatedType === undefined) {
                    this.varableDecl(field.name, field.type);
                    t(";\n");
                }
            }
        });
    }

    protected writeGQLParameters() {
        
        const t = this.text.bind(this);

        t("\nconst GQL_PARAMS: {[key: string]: string} = ");
        this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
            for (const field of this.fields) {
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t(`"${field.name}": `);
                    this.scope({type: "BLANK", prefix: '"', suffix: '"'}, () => {
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

    protected writeGQLArguments() {
        
        const t = this.text.bind(this);

        t("\nconst GQL_ARGS: {[key: string]: string} = ");
        this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
            for (const field of this.fields) {
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t(`"${field.name}": `);
                    this.scope({type: "BLANK", prefix: '"', suffix: '"'}, () => {
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