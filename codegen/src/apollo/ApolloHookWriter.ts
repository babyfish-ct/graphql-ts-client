/**
 * @author ChenTao
 * 
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 * 
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */

import { WriteStream } from "fs";
import { GraphQLField } from "graphql";
import { associatedTypeOf } from "../Associations";
import { GeneratorConfig } from "../GeneratorConfig";
import { Writer } from "../Writer";

export class ApolloHookWriter extends Writer {

    protected readonly hasTypedHooks: boolean;

    protected readonly hasSimpleHooks: boolean;

    constructor(
        private hookType: "Query" | "Mutation",
        private fields: GraphQLField<unknown, unknown>[],
        stream: WriteStream, 
        config: GeneratorConfig
    ) {
        super(stream, config);
        this.hasTypedHooks = this.fields.find(field => associatedTypeOf(field.type) !== undefined) !== undefined;
        this.hasSimpleHooks = this.fields.find(field => associatedTypeOf(field.type) === undefined) !== undefined;
    }

    protected prepareImportings() {
        this.importStatement("import { Fetcher, replaceNullValues } from 'graphql-ts-client-api';");
        if (this.hookType === "Query") {
            this.importStatement(`import { useQuery, useLazyQuery, QueryHookOptions, QueryResult, QueryTuple, gql } from '@apollo/client';`);
        } else {
            this.importStatement(`import { useMutation, MutationHookOptions, DefaultContext, MutationTuple, ApolloCache, gql } from '@apollo/client';`);
        }
        for (const field of this.fields) {
            for (const arg of field.args) {
                this.importType(arg.type);
            }
            if (associatedTypeOf(field.type) === undefined) {
                this.importType(field.type);
            }
        }
    }

    protected isUnderGlobalDir() {
        return true;
    }

    protected writeCode() {

        if (this.hookType === 'Query') {
            this.writeTypedHook('QueryResult');
            this.writeTypedHook('QueryTuple', '[1]', 'Lazy');
            this.writeSimpleHook('QueryResult');
            this.writeSimpleHook('QueryTuple', 'Lazy');
        } else {
            this.writeTypedHook('MutationTuple', '[1]');
            this.writeSimpleHook('MutationTuple');
        }

        this.text(DIVIDER_LINE);

        this.writeVariables();
        this.writeFetchableTypes();
        this.writeFetchedTypes();
        this.writeSimpleTypes();

        this.text(DIVIDER_LINE);
        
        this.writeGQLParameters();
        this.writeGQLArguments();
    }

    private writeTypedHook(returnType: string, responseDataProp = "", prefix: string = "") {

        if (!this.hasTypedHooks) {
            return;
        }

        const t = this.text.bind(this);
        const lowercaseHookType = this.hookType.toLowerCase();

        t(`\nexport function use${prefix}Typed${this.hookType}`);
        this.scope({type: "GENERIC", multiLines: true}, () => {
            t(`T${this.hookType}Key extends keyof ${this.hookType}FetchableTypes`);
            this.separator();
            t("T extends object");
            if (this.hookType === 'Mutation') {
                this.separator();
                t("TContext = DefaultContext");
                this.separator();
                t("TCache extends ApolloCache<any> = ApolloCache<any>");
            }
            this.separator(); 
            t(`TDataKey extends string = T${this.hookType}Key`);
        });
        this.scope({type: "PARAMETERS", multiLines: true}, () => {
            
            t(`key: T${this.hookType}Key | `); 
            this.scope({type: "BLOCK", multiLines: true}, () => {
                t(`readonly ${lowercaseHookType}Key: T${this.hookType}Key;\n`);
                t("readonly dataKey?: TDataKey;\n");
                t("readonly operationName?: string;\n");
            });

            this.separator();

            t("fetcher: Fetcher");
            this.scope({type: "GENERIC"}, () => {
                t(`${this.hookType}FetchableTypes[T${this.hookType}Key]`);
                this.separator();
                t("T");
            });

            this.separator();
            
            t(`options: ${this.hookType}HookOptions`);
            this.scope({type: "GENERIC"}, () => {
                t(`Record<TDataKey, ${this.hookType}FetchedTypes<T>[T${this.hookType}Key]>`);
                this.separator();
                t(`${this.hookType}Variables[T${this.hookType}Key]`);
                if (this.hookType === 'Mutation') {
                    this.separator(),
                    t("TContext");
                }
            });
        });
        t(`: ${returnType}`);
        this.writeReturnedGenericArgs("FetchedTypes<T>");
        this.scope({"type": "BLOCK", multiLines: true, prefix: " ", suffix: "\n"}, () => {
            this.writeRequestDeclaration(true);
            t(`const response = use${prefix}${this.hookType}`);
            this.writeReturnedGenericArgs("FetchedTypes<T>");
            t("(request, options);\n");
            t(`replaceNullValues(response${responseDataProp}.data);\n`);
            t("return response;\n");
        });
    }

    private writeSimpleHook(returnType: string, prefix: string = "") {
        
        if (!this.hasSimpleHooks) {
            return;
        }

        const t = this.text.bind(this);
        const lowercaseHookType = this.hookType.toLowerCase();
        
        t(`\nexport function use${prefix}Simple${this.hookType}`);
        this.scope({type: "GENERIC", multiLines: this.hookType === 'Mutation'}, () => {
            t(`T${this.hookType}Key extends Exclude<keyof ${this.hookType}Variables, keyof ${this.hookType}FetchableTypes>`);
            if (this.hookType === 'Mutation') {
                this.separator();
                t("TContext = DefaultContext");
                this.separator();
                t("TCache extends ApolloCache<any> = ApolloCache<any>");
            }
            this.separator();
            t(`TDataKey extends string = T${this.hookType}Key`);
        });
        this.scope({type: "PARAMETERS", multiLines: true}, () => {
            
            t(`key: T${this.hookType}Key | `); 
            this.scope({type: "BLOCK", multiLines: true}, () => {
                t(`readonly ${lowercaseHookType}Key: T${this.hookType}Key;\n`);
                t("readonly dataKey?: TDataKey;\n");
                t("readonly operationName?: string;\n");
            });
            
            this.separator();

            t(`options: ${this.hookType}HookOptions`);
            this.scope({type: "GENERIC"}, () => {
                t(`Record<TDataKey, ${this.hookType}SimpleTypes[T${this.hookType}Key]>`);

                this.separator();
                
                t(`${this.hookType}Variables[T${this.hookType}Key]`);
                if (this.hookType === 'Mutation') {
                    this.separator(),
                    t("TContext");
                }
            });
        });
        t(`: ${returnType}`);
        this.writeReturnedGenericArgs("SimpleTypes");
        this.scope({"type": "BLOCK", multiLines: true, prefix: " ", suffix: "\n"}, () => {
            this.writeRequestDeclaration(false);
            t(`return use${prefix}${this.hookType}`);
            this.writeReturnedGenericArgs("SimpleTypes");
            t("(request, options);\n");
        });
    }

    private writeReturnedGenericArgs(typesName: "FetchedTypes<T>" | "SimpleTypes") {
        
        const t = this.text.bind(this);

        this.scope({type: "GENERIC", multiLines: this.hookType === 'Mutation'}, () => {
            t(`Record<TDataKey, ${this.hookType}${typesName}[T${this.hookType}Key]>`);
            this.separator();
            t(`${this.hookType}Variables[T${this.hookType}Key]`);
            if (this.hookType === 'Mutation') {
                this.separator(),
                t("TContext");
                this.separator(),
                t("TCache");
            }
        });
    }

    private writeRequestDeclaration(hasFetcher: boolean) {

        const t = this.text.bind(this);
        const lowercaseHookType = this.hookType.toLowerCase();

        t(`const ${lowercaseHookType}Key = typeof key === 'string' ? key : key.${lowercaseHookType}Key;\n`);
        t(`const dataKey = typeof key === 'object' ? key.dataKey : undefined;\n`);
        t(`const operationName = typeof key === 'object' ? key.operationName : undefined;\n`);

        t("const request = gql");
        this.scope({type: "BLANK", prefix: "`", suffix: "`;\n", multiLines: true}, () => {
            t(lowercaseHookType);
            t(` \${operationName ?? ${lowercaseHookType}Key}`);
            t(`\${GQL_PARAMS[${lowercaseHookType}Key] ?? ""} {\n`);
            this.scope({type: "BLANK"}, () => {
                t(`\${dataKey ? dataKey + ": " : ""}`);
                t(`\${${lowercaseHookType}Key}\${GQL_ARGS[${lowercaseHookType}Key] ?? ""}`);
                if (hasFetcher) {
                    t("${fetcher.toString()}");
                }
            });
            t("}\n");
            if (hasFetcher) {
                t("${fetcher.toFragmentString()}\n");
            }
        });
    }

    private writeVariables() {

        const t = this.text.bind(this);

        t(`\nexport interface ${this.hookType}Variables`);
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

    private writeFetchableTypes() {
        
        const t = this.text.bind(this);

        t("\nexport interface ");
        t(this.hookType);
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

    private writeFetchedTypes() {

        const t = this.text.bind(this);

        t("\nexport interface ");
        t(this.hookType);
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

    private writeSimpleTypes() {
        
        const t = this.text.bind(this);

        t("\nexport interface ");
        t(this.hookType);
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

    private writeGQLParameters() {
        
        const t = this.text.bind(this);

        t("\nconst GQL_PARAMS: {[key: string]: string} = ");
        this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
            for (const field of this.fields) {
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t(`"${field.name}": `);
                    this.scope({type: "BLANK", prefix: '"(', suffix: ')"'}, () => {
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

    private writeGQLArguments() {
        
        const t = this.text.bind(this);

        t("\nconst GQL_ARGS: {[key: string]: string} = ");
        this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
            for (const field of this.fields) {
                if (field.args.length !== 0) {
                    this.separator(", ");
                    t(`"${field.name}": `);
                    this.scope({type: "BLANK", prefix: '"(', suffix: ')"'}, () => {
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

const DIVIDER_LINE = "\n//////////////////////////////////////////////////\n";