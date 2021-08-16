"use strict";
/**
 * @author ChenTao
 *
 * 'graphql-ts-client' is a graphql client for TypeScript, it has two functionalities:
 *
 * 1. Supports GraphQL queries with strongly typed code
 *
 * 2. Automatically infers the type of the returned data according to the strongly typed query
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloHookWriter = void 0;
const Associations_1 = require("../Associations");
const Writer_1 = require("../Writer");
class ApolloHookWriter extends Writer_1.Writer {
    constructor(hookType, fields, stream, config) {
        super(stream, config);
        this.hookType = hookType;
        this.fields = fields;
        this.hasTypedHooks = this.fields.find(field => Associations_1.associatedTypeOf(field.type) !== undefined) !== undefined;
        this.hasSimpleHooks = this.fields.find(field => Associations_1.associatedTypeOf(field.type) === undefined) !== undefined;
    }
    prepareImportings() {
        this.importStatement("import { Fetcher, replaceNullValues } from 'graphql-ts-client-api';");
        if (this.hookType === "Query") {
            this.importStatement(`import { useQuery, useLazyQuery, QueryHookOptions, QueryResult, QueryTuple, gql } from '@apollo/client';`);
            if (this.hasTypedHooks) {
                this.importStatement("import { useContext, useEffect } from 'react';");
                this.importStatement("import { dependencyManagerContext } from './DependencyManager';");
            }
        }
        else {
            this.importStatement(`import { useMutation, MutationHookOptions, DefaultContext, MutationTuple, ApolloCache, gql } from '@apollo/client';`);
        }
        for (const field of this.fields) {
            for (const arg of field.args) {
                this.importType(arg.type);
            }
            if (Associations_1.associatedTypeOf(field.type) === undefined) {
                this.importType(field.type);
            }
        }
    }
    isUnderGlobalDir() {
        return true;
    }
    writeCode() {
        if (this.hookType === 'Query') {
            this.writeTypedHook('QueryResult');
            this.writeTypedHook('QueryTuple', '[1]', 'Lazy');
            this.writeSimpleHook('QueryResult');
            this.writeSimpleHook('QueryTuple', 'Lazy');
        }
        else {
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
    writeTypedHook(returnType, responseDataProp = "", prefix = "") {
        if (!this.hasTypedHooks) {
            return;
        }
        const t = this.text.bind(this);
        const lowercaseHookType = this.hookType.toLowerCase();
        t(`\nexport function use${prefix}Typed${this.hookType}`);
        this.scope({ type: "GENERIC", multiLines: true }, () => {
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
        this.scope({ type: "PARAMETERS", multiLines: true }, () => {
            t(`key: T${this.hookType}Key | `);
            this.scope({ type: "BLOCK", multiLines: true }, () => {
                t(`readonly ${lowercaseHookType}Key: T${this.hookType}Key;\n`);
                t("readonly dataKey?: TDataKey;\n");
                t("readonly operationName?: string;\n");
            });
            this.separator();
            t("fetcher: Fetcher");
            this.scope({ type: "GENERIC" }, () => {
                t(`${this.hookType}FetchableTypes[T${this.hookType}Key]`);
                this.separator();
                t("T");
            });
            this.separator();
            t(`options?: ${this.hookType}HookOptions`);
            this.scope({ type: "GENERIC" }, () => {
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
        this.scope({ "type": "BLOCK", multiLines: true, prefix: " ", suffix: "\n" }, () => {
            this.writeRequestDeclaration(true);
            if (this.hookType === 'Query') {
                this.writeDependencyRegisitry();
            }
            t(`const response = use${prefix}${this.hookType}`);
            this.writeReturnedGenericArgs("FetchedTypes<T>");
            t("(gql(request), options);\n");
            t(`replaceNullValues(response${responseDataProp}.data);\n`);
            t("return response;\n");
        });
    }
    writeSimpleHook(returnType, prefix = "") {
        if (!this.hasSimpleHooks) {
            return;
        }
        const t = this.text.bind(this);
        const lowercaseHookType = this.hookType.toLowerCase();
        t(`\nexport function use${prefix}Simple${this.hookType}`);
        this.scope({ type: "GENERIC", multiLines: this.hookType === 'Mutation' }, () => {
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
        this.scope({ type: "PARAMETERS", multiLines: true }, () => {
            t(`key: T${this.hookType}Key | `);
            this.scope({ type: "BLOCK", multiLines: true }, () => {
                t(`readonly ${lowercaseHookType}Key: T${this.hookType}Key;\n`);
                t("readonly dataKey?: TDataKey;\n");
                t("readonly operationName?: string;\n");
            });
            this.separator();
            t(`options?: ${this.hookType}HookOptions`);
            this.scope({ type: "GENERIC" }, () => {
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
        this.scope({ "type": "BLOCK", multiLines: true, prefix: " ", suffix: "\n" }, () => {
            this.writeRequestDeclaration(false);
            t(`return use${prefix}${this.hookType}`);
            this.writeReturnedGenericArgs("SimpleTypes");
            t("(gql(request), options);\n");
        });
    }
    writeReturnedGenericArgs(typesName) {
        const t = this.text.bind(this);
        this.scope({ type: "GENERIC", multiLines: this.hookType === 'Mutation' }, () => {
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
    writeRequestDeclaration(hasFetcher) {
        const t = this.text.bind(this);
        const lowercaseHookType = this.hookType.toLowerCase();
        t(`const ${lowercaseHookType}Key = typeof key === 'string' ? key : key.${lowercaseHookType}Key;\n`);
        t(`const dataKey = typeof key === 'object' ? key.dataKey : undefined;\n`);
        t(`const operationName = typeof key === 'object' ? key.operationName : undefined;\n`);
        t("const request = ");
        this.scope({ type: "BLANK", prefix: "`", suffix: "`;\n", multiLines: true }, () => {
            t(lowercaseHookType);
            t(` \${operationName ?? ${lowercaseHookType}Key}`);
            t(`\${GQL_PARAMS[${lowercaseHookType}Key] ?? ""} {\n`);
            this.scope({ type: "BLANK" }, () => {
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
    writeDependencyRegisitry() {
        const t = this.text.bind(this);
        t('const dependencyManager = useContext(dependencyManagerContext);\n');
        t("useEffect(() => ");
        this.scope({ type: "BLOCK", multiLines: true }, () => {
            t("if (dependencyManager !== undefined) ");
            this.scope({ type: "BLOCK", multiLines: true }, () => {
                t("dependencyManager.register(operationName ?? queryKey, [fetcher]);\n");
                t("return () => { dependencyManager.unregister(operationName ?? queryKey); };\n");
            });
            t("// eslint-disable-next-line");
        });
        t(", [dependencyManager, operationName, queryKey, request]); // Eslint disable is required becasue 'fetcher' is replaced by 'request' here.\n");
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
exports.ApolloHookWriter = ApolloHookWriter;
const DIVIDER_LINE = "\n//////////////////////////////////////////////////\n";
