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
        this.importStatement("import { Fetcher, replaceNullValues, toMd5 } from 'graphql-ts-client-api';");
        this.importStatement("import { DocumentNode } from 'graphql';");
        if (this.hookType === "Query") {
            this.importStatement(`import { useQuery, useLazyQuery, QueryHookOptions, QueryResult, QueryTuple, gql } from '@apollo/client';`);
            if (this.hasTypedHooks) {
                this.importStatement("import { useContext, useEffect, useMemo } from 'react';");
                this.importStatement("import { dependencyManagerContext } from './DependencyManager';");
            }
        }
        else {
            this.importStatement(`import { useMutation, MutationHookOptions, DefaultContext, MutationTuple, ApolloCache, FetchResult, InternalRefetchQueriesInclude, gql } from '@apollo/client';`);
            if (this.hasTypedHooks) {
                this.importStatement("import { useContext, useMemo } from 'react';");
                this.importStatement("import { dependencyManagerContext, RefetchableDependencies } from './DependencyManager';");
            }
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
                t(OPERATION_NAME_DOC);
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
            t(' & ');
            this.scope({ type: "BLOCK", multiLines: true }, () => {
                if (this.hookType === 'Query') {
                    t("readonly registerDependencies?: boolean | { readonly fieldDependencies: readonly Fetcher<string, object>[] }");
                }
                else {
                    t("readonly refetchDependencies?: ");
                    this.scope({ type: "PARAMETERS", multiLines: true }, () => {
                        t(`result: FetchResult<Record<TDataKey, ${this.hookType}FetchedTypes<T>[T${this.hookType}Key]>> &`);
                        t("{ dependencies: RefetchableDependencies<T> }");
                    });
                    t(" => InternalRefetchQueriesInclude");
                }
            });
        });
        t(`: ${returnType}`);
        this.writeReturnOrOptionsGenericArgs("FetchedTypes<T>");
        this.scope({ "type": "BLOCK", multiLines: true, prefix: " ", suffix: "\n" }, () => {
            this.writeRequestDeclaration(true);
            if (this.hookType === 'Query') {
                this.writeDependencyRegistry();
            }
            else {
                this.writeDependencyTrigger();
            }
            t(`const response = use${prefix}${this.hookType}`);
            this.writeReturnOrOptionsGenericArgs("FetchedTypes<T>");
            t(`(request, ${this.hookType === 'Mutation' ? 'newOptions' : 'options'});\n`);
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
        this.writeReturnOrOptionsGenericArgs("SimpleTypes");
        this.scope({ "type": "BLOCK", multiLines: true, prefix: " ", suffix: "\n" }, () => {
            this.writeRequestDeclaration(false);
            t(`return use${prefix}${this.hookType}`);
            this.writeReturnOrOptionsGenericArgs("SimpleTypes");
            t("(request, options);\n");
        });
    }
    writeReturnOrOptionsGenericArgs(typesName, forOptions = false) {
        const t = this.text.bind(this);
        this.scope({ type: "GENERIC", multiLines: this.hookType === 'Mutation' }, () => {
            t(`Record<TDataKey, ${this.hookType}${typesName}[T${this.hookType}Key]>`);
            this.separator();
            t(`${this.hookType}Variables[T${this.hookType}Key]`);
            if (this.hookType === 'Mutation') {
                this.separator(),
                    t("TContext");
                if (!forOptions) {
                    this.separator(),
                        t("TCache");
                }
            }
        });
    }
    writeRequestDeclaration(hasFetcher) {
        const t = this.text.bind(this);
        const lowercaseHookType = this.hookType.toLowerCase();
        t(`const ${lowercaseHookType}Key = typeof key === 'string' ? key : key.${lowercaseHookType}Key;\n`);
        t(`const dataKey = typeof key === 'object' ? key.dataKey : undefined;\n`);
        t("const requestWithoutOperation = ");
        this.scope({ type: "BLANK", prefix: "`", suffix: "`;\n", multiLines: true }, () => {
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
        if (this.hookType === 'Query') {
            t("const [operationName, request] = useMemo<[string, DocumentNode]>(() => ");
        }
        else {
            t("const request = useMemo<DocumentNode>(() => ");
        }
        this.scope({ type: "BLOCK", multiLines: true }, () => {
            t(`const operationName = (typeof key === 'object' ? key.operationName : undefined) ?? \`\${${lowercaseHookType}Key}_\${toMd5(requestWithoutOperation)}\`;\n`);
            if (this.hookType === 'Query') {
                t(`return [operationName, gql\`${lowercaseHookType} \${operationName}\${requestWithoutOperation}\`];\n`);
            }
            else {
                t(`return gql\`${lowercaseHookType} \${operationName}\${requestWithoutOperation}\`;\n`);
            }
        });
        t(`, [${lowercaseHookType}Key, requestWithoutOperation, key]);\n`);
    }
    writeDependencyRegistry() {
        const t = this.text.bind(this);
        t('const [dependencyManager, config] = useContext(dependencyManagerContext);\n');
        t("const register = options?.registerDependencies !== undefined ? !!options.registerDependencies : config?.defaultRegisterDependencies ?? false;\n");
        t("if (register && dependencyManager === undefined) ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
            t(`throw new Error("The property 'registerDependencies' of options requires <DependencyManagerProvider/>");\n`);
        });
        t("useEffect(() => ");
        this.scope({ type: "BLOCK", multiLines: true }, () => {
            t("if (register) ");
            this.scope({ type: "BLOCK", multiLines: true }, () => {
                t("dependencyManager!.register");
                this.scope({ type: "PARAMETERS", multiLines: true, suffix: ";\n" }, () => {
                    t("operationName ?? queryKey");
                    this.separator();
                    t("fetcher");
                    this.separator();
                    t("typeof options?.registerDependencies === 'object' ? options?.registerDependencies?.fieldDependencies : undefined");
                });
                t("return () => { dependencyManager!.unregister(operationName ?? queryKey); };\n");
            });
            t("// eslint-disable-next-line");
        });
        t(", [register, dependencyManager, operationName, queryKey, options?.registerDependencies, request]); // Eslint disable is required becasue 'fetcher' is replaced by 'request' here.\n");
    }
    writeDependencyTrigger() {
        const t = this.text.bind(this);
        t('const [dependencyManager] = useContext(dependencyManagerContext);\n');
        t("if (options?.refetchDependencies && dependencyManager === undefined) ");
        this.scope({ type: "BLOCK", multiLines: true }, () => {
            t(`throw new Error("The property 'refetchDependencies' of options requires <DependencyManagerProvider/>");\n`);
        });
        t('const dependencies = useMemo<RefetchableDependencies<T>>(() => ');
        this.scope({ type: "BLOCK", multiLines: true }, () => {
            t("const ofResult = (oldObject: T | undefined, newObject?: T | undefined): string[] => ");
            this.scope({ type: "BLOCK", multiLines: true, suffix: ";\n" }, () => {
                t("return dependencyManager!.resources(fetcher, oldObject, newObject);\n");
            });
            t("const ofError = (): string[] => ");
            this.scope({ type: "BLOCK", multiLines: true, suffix: ";\n" }, () => {
                t("return [];\n");
            });
            t("return { ofResult, ofError };\n");
            t("// eslint-disable-next-line");
        });
        t(", [dependencyManager, request]); // Eslint disable is required becasue 'fetcher' is replaced by 'request' here.\n");
        t("if (options?.refetchDependencies && options?.refetchQueries) ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
            t(`throw new Error("The property 'refetchDependencies' and 'refetchQueries' of options cannot be specified at the same time");\n`);
        });
        t("const newOptions = useMemo<MutationHookOptions");
        this.writeReturnOrOptionsGenericArgs("FetchedTypes<T>", true);
        t(" | undefined>(() => ");
        this.scope({ type: "BLOCK", multiLines: true }, () => {
            t("const refetchDependencies = options?.refetchDependencies;\n");
            t("if (refetchDependencies === undefined) ");
            this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
                t("return options;\n");
            });
            t("const cloned: MutationHookOptions");
            this.writeReturnOrOptionsGenericArgs("FetchedTypes<T>", true);
            t(" = { ...options };\n");
            t("cloned.refetchQueries = result => ");
            this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
                t("return refetchDependencies({...result, dependencies});\n");
            });
            t("return cloned;\n");
        });
        t(", [options, dependencies]);\n");
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
const OPERATION_NAME_DOC = `
/*
 * OperationName is not necessary, and it is not recommended to specify its value.
 * If it's not speicified, a md5 code base on the request is used to be the suffix of actual operation name.
 * 
 * Maybe sometimes you need to make the request body more readable, you can specify it,
 * but be careful, please make sure each query has a unique operations; 
 * otherwise, both Apollo/client and DependencyManager cannot work normally.
 * Please view "Each included query is executed with its most recently provided set of variables."
 * in https://www.apollographql.com/docs/react/data/mutations/#refetching-queries to know more.
 */
`;
