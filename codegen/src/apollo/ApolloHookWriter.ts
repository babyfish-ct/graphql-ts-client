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
import { AbstractHookWriter } from "../AbstractOperationWriter";
import { associatedTypeOf } from "../Associations";
import { GeneratorConfig } from "../GeneratorConfig";
import { Writer } from "../Writer";

export class ApolloHookWriter extends AbstractHookWriter {

    constructor(
        operationType: "Query" | "Mutation",
        fields: GraphQLField<unknown, unknown>[],
        stream: WriteStream, 
        config: GeneratorConfig
    ) {
        super(operationType, fields, stream, config);
    }

    protected prepareImportings() {
        this.importStatement("import { Fetcher, util } from 'graphql-ts-client-api';");
        this.importStatement("import { DocumentNode } from 'graphql';");
        if (this.operationType === "Query") {
            this.importStatement(`import { useQuery, useLazyQuery, QueryHookOptions, QueryResult, QueryTuple, gql } from '@apollo/client';`);
            if (this.hasTypedHooks) {
                this.importStatement("import { useContext, useEffect, useMemo } from 'react';");
                this.importStatement("import { dependencyManagerContext } from './DependencyManager';");
            }
        } else {
            this.importStatement(`import { useMutation, MutationHookOptions, DefaultContext, MutationTuple, ApolloCache, FetchResult, InternalRefetchQueriesInclude, gql } from '@apollo/client';`);
            if (this.hasTypedHooks) {
                this.importStatement("import { useContext, useMemo } from 'react';");
                this.importStatement("import { dependencyManagerContext, RefetchableDependencies } from './DependencyManager';");
            }
        }
        super.prepareImportings();
    }

    protected writeCode() {

        if (this.operationType === 'Query') {
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

    private writeTypedHook(returnType: string, responseDataProp: "" | "[1]" = "", prefix: string = "") {

        if (!this.hasTypedHooks) {
            return;
        }

        const t = this.text.bind(this);
        const lowercaseHookType = this.operationType.toLowerCase();

        t(`\nexport function use${prefix}Typed${this.operationType}`);
        this.scope({type: "GENERIC", multiLines: true}, () => {
            t(`T${this.operationType}Key extends keyof ${this.operationType}FetchableTypes`);
            this.separator();
            t("T extends object");
            if (this.operationType === 'Mutation') {
                this.separator();
                t("TContext = DefaultContext");
                this.separator();
                t("TCache extends ApolloCache<any> = ApolloCache<any>");
            }
            this.separator(); 
            t(`TDataKey extends string = T${this.operationType}Key`);
        });
        this.scope({type: "PARAMETERS", multiLines: true}, () => {
            
            t(`key: T${this.operationType}Key | `); 
            this.scope({type: "BLOCK", multiLines: true}, () => {
                t(`readonly ${lowercaseHookType}Key: T${this.operationType}Key;\n`);
                t("readonly dataKey?: TDataKey;\n");
                t(OPERATION_NAME_DOC);
                t("readonly operationName?: string;\n");
            });

            this.separator();

            t("fetcher: Fetcher");
            this.scope({type: "GENERIC"}, () => {
                t(`${this.operationType}FetchableTypes[T${this.operationType}Key]`);
                this.separator();
                t("T");
            });

            this.separator();
            
            t(`options?: ${this.operationType}HookOptions`);
            this.scope({type: "GENERIC"}, () => {
                t(`Record<TDataKey, ${this.operationType}FetchedTypes<T>[T${this.operationType}Key]>`);
                this.separator();
                t(`${this.operationType}Variables[T${this.operationType}Key]`);
                if (this.operationType === 'Mutation') {
                    this.separator(),
                    t("TContext");
                }
            });
            t(' & ');
            this.scope({type: "BLOCK", multiLines: true}, () => {
                if (this.operationType === 'Query') {
                    t("readonly registerDependencies?: boolean | { readonly fieldDependencies: readonly Fetcher<string, object>[] }");
                } else {
                    t("readonly refetchDependencies?: ");
                    this.scope({type: "PARAMETERS", multiLines: true}, () => {
                        t(`result: FetchResult<Record<TDataKey, ${this.operationType}FetchedTypes<T>[T${this.operationType}Key]>> &`);
                        t("{ dependencies: RefetchableDependencies<T> }");
                    });
                    t(" => InternalRefetchQueriesInclude");
                }
            })
        });
        t(`: ${returnType}`);
        this.writeReturnOrOptionsGenericArgs("FetchedTypes<T>");
        this.scope({"type": "BLOCK", multiLines: true, prefix: " ", suffix: "\n"}, () => {
            this.writeRequestDeclaration(true);
            if (this.operationType === 'Query') {
                this.writeDependencyRegistry();
            } else {
                this.writeDependencyTrigger();
            }
            t(`const response = use${prefix}${this.operationType}`);
            this.writeReturnOrOptionsGenericArgs("FetchedTypes<T>");
            t(`(request, ${this.operationType === 'Mutation' ? 'newOptions' : 'options'});\n`);
            t(`const responseData = response${responseDataProp}.data;\n`);
            t(`const newResponseData = useMemo(() => util.exceptNullValues(responseData), [responseData]);\n`);
            t("return newResponseData === responseData ? response : util.produce(response, draft => ");
            this.scope({type: "BLOCK", multiLines: true}, () => {
                t(`draft${responseDataProp}.data = util.produce(newResponseData, () => {});\n`)
            });
            t(");\n");
        });
    }

    private writeSimpleHook(returnType: string, prefix: string = "") {
        
        if (!this.hasSimpleHooks) {
            return;
        }

        const t = this.text.bind(this);
        const lowercaseHookType = this.operationType.toLowerCase();
        
        t(`\nexport function use${prefix}Simple${this.operationType}`);
        this.scope({type: "GENERIC", multiLines: this.operationType === 'Mutation'}, () => {
            t(`T${this.operationType}Key extends Exclude<keyof ${this.operationType}Variables, keyof ${this.operationType}FetchableTypes>`);
            if (this.operationType === 'Mutation') {
                this.separator();
                t("TContext = DefaultContext");
                this.separator();
                t("TCache extends ApolloCache<any> = ApolloCache<any>");
            }
            this.separator();
            t(`TDataKey extends string = T${this.operationType}Key`);
        });
        this.scope({type: "PARAMETERS", multiLines: true}, () => {
            
            t(`key: T${this.operationType}Key | `); 
            this.scope({type: "BLOCK", multiLines: true}, () => {
                t(`readonly ${lowercaseHookType}Key: T${this.operationType}Key;\n`);
                t("readonly dataKey?: TDataKey;\n");
                t("readonly operationName?: string;\n");
            });
            
            this.separator();

            t(`options?: ${this.operationType}HookOptions`);
            this.scope({type: "GENERIC"}, () => {
                t(`Record<TDataKey, ${this.operationType}SimpleTypes[T${this.operationType}Key]>`);

                this.separator();
                
                t(`${this.operationType}Variables[T${this.operationType}Key]`);
                if (this.operationType === 'Mutation') {
                    this.separator(),
                    t("TContext");
                }
            });
        });
        t(`: ${returnType}`);
        this.writeReturnOrOptionsGenericArgs("SimpleTypes");
        this.scope({"type": "BLOCK", multiLines: true, prefix: " ", suffix: "\n"}, () => {
            this.writeRequestDeclaration(false);
            t(`return use${prefix}${this.operationType}`);
            this.writeReturnOrOptionsGenericArgs("SimpleTypes");
            t("(request, options);\n");
        });
    }

    private writeReturnOrOptionsGenericArgs(typesName: "FetchedTypes<T>" | "SimpleTypes", forOptions: boolean = false) {
        
        const t = this.text.bind(this);

        this.scope({type: "GENERIC", multiLines: this.operationType === 'Mutation'}, () => {
            t(`Record<TDataKey, ${this.operationType}${typesName}[T${this.operationType}Key]>`);
            this.separator();
            t(`${this.operationType}Variables[T${this.operationType}Key]`);
            if (this.operationType === 'Mutation') {
                this.separator(),
                t("TContext");
                if (!forOptions) {
                    this.separator(),
                    t("TCache");
                }
            }
        });
    }

    private writeRequestDeclaration(hasFetcher: boolean) {

        const t = this.text.bind(this);
        const lowercaseHookType = this.operationType.toLowerCase();

        t(`const ${lowercaseHookType}Key = typeof key === 'string' ? key : key.${lowercaseHookType}Key;\n`);
        t(`const dataKey = typeof key === 'object' ? key.dataKey : undefined;\n`);
        
        t("const requestWithoutOperation = ");
        this.scope({type: "BLANK", prefix: "`", suffix: "`;\n", multiLines: true}, () => {
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
        if (this.operationType === 'Query') {
            t("const [operationName, request] = useMemo<[string, DocumentNode]>(() => ");
        } else {
            t("const request = useMemo<DocumentNode>(() => ");
        }
        this.scope({type: "BLOCK", multiLines: true}, () => {
            t(`const operationName = (typeof key === 'object' ? key.operationName : undefined) ?? \`\${${lowercaseHookType}Key}_\${util.toMd5(requestWithoutOperation)}\`;\n`);
            if (this.operationType === 'Query') {
                t(`return [operationName, gql\`${lowercaseHookType} \${operationName}\${requestWithoutOperation}\`];\n`);
            } else {
                t(`return gql\`${lowercaseHookType} \${operationName}\${requestWithoutOperation}\`;\n`);
            }
        });
        t(`, [${lowercaseHookType}Key, requestWithoutOperation, key]);\n`);
    }

    private writeDependencyRegistry() {

        const t = this.text.bind(this);
        
        t('const [dependencyManager, config] = useContext(dependencyManagerContext);\n');
        t("const register = options?.registerDependencies !== undefined ? !!options.registerDependencies : config?.defaultRegisterDependencies ?? false;\n");
        t("if (register && dependencyManager === undefined) ");
        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
            t(`throw new Error("The property 'registerDependencies' of options requires <DependencyManagerProvider/>");\n`);
        });

        t("useEffect(() => ");
        this.scope({type: "BLOCK", multiLines: true}, () => {
            t("if (register) ");
            this.scope({type: "BLOCK", multiLines: true}, () => {
                t("dependencyManager!.register");
                this.scope({type: "PARAMETERS", multiLines: true, suffix: ";\n"}, () => {
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
        t(", [register, dependencyManager, operationName, queryKey, options?.registerDependencies, request]); // Eslint disable is required, becasue 'fetcher' is replaced by 'request' here.\n");
    }

    private writeDependencyTrigger() {

        const t = this.text.bind(this);

        t('const [dependencyManager] = useContext(dependencyManagerContext);\n');

        t("if (options?.refetchDependencies && dependencyManager === undefined) ");
        this.scope({type: "BLOCK", multiLines: true}, () => {
            t(`throw new Error("The property 'refetchDependencies' of options requires <DependencyManagerProvider/>");\n`);
        });

        t('const dependencies = useMemo<RefetchableDependencies<T>>(() => ');
        this.scope({type: "BLOCK", multiLines: true}, () => {
            t("const ofResult = (oldObject: T | undefined, newObject?: T | undefined): string[] => ");
            this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                t("return dependencyManager!.resources(fetcher, oldObject, newObject);\n");
            });
            t("const ofError = (): string[] => ");
            this.scope({type: "BLOCK", multiLines: true, suffix: ";\n"}, () => {
                t("return [];\n");
            });
            t("return { ofResult, ofError };\n");
            t("// eslint-disable-next-line");
        });
        t(", [dependencyManager, request]); // Eslint disable is required becasue 'fetcher' is replaced by 'request' here.\n");

        t("if (options?.refetchDependencies && options?.refetchQueries) ");
        this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
            t(`throw new Error("The property 'refetchDependencies' and 'refetchQueries' of options cannot be specified at the same time");\n`);
        });
        t("const newOptions = useMemo<MutationHookOptions");
        this.writeReturnOrOptionsGenericArgs("FetchedTypes<T>", true);
        t(" | undefined>(() => ");
        this.scope({type: "BLOCK", multiLines: true}, () => {
            t("const refetchDependencies = options?.refetchDependencies;\n");
            t("if (refetchDependencies === undefined) ");
            this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
                t("return options;\n");
            });
            t("const cloned: MutationHookOptions");
            this.writeReturnOrOptionsGenericArgs("FetchedTypes<T>", true);
            t(" = { ...options };\n");
            t("cloned.refetchQueries = result => ");
            this.scope({type: "BLOCK", multiLines: true, suffix: "\n"}, () => {
                t("return refetchDependencies({...result, dependencies});\n");
            });
            t("return cloned;\n");
        });
        t(", [options, dependencies]);\n");
    }
}

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
`