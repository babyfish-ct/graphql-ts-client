"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayHookWriter = void 0;
const AbstractOperationWriter_1 = require("../AbstractOperationWriter");
class RelayHookWriter extends AbstractOperationWriter_1.AbstractHookWriter {
    constructor(operationType, fields, stream, config) {
        super(operationType, fields, stream, config);
    }
    prepareImportings() {
        this.importStatement('import { Fetcher, buildRequest } from "graphql-ts-client-api";');
        this.importStatement(`import { Relay${this.operationType} } from "./Relay";`);
        super.prepareImportings();
    }
    writeCode() {
        this.writeTypedOperation();
        this.writeSimpleOperation();
        this.writeOperationImpl();
        this.writeVariables();
        this.writeFetchableTypes();
        this.writeFetchedTypes();
        this.writeSimpleTypes();
        this.writeVariableTypeMaps();
        this.writeResultPlurals();
    }
    writeTypedOperation() {
        if (!this.hasTypedHooks) {
            return;
        }
        const t = this.text.bind(this);
        t(`\nexport function createTyped${this.operationType}`);
        this.scope({ type: "GENERIC", multiLines: true }, () => {
            t(`T${this.operationType}Key extends keyof ${this.operationType}FetchableTypes`);
            this.separator(", ");
            t("T extends object");
            this.separator(", ");
            t("TUnresolvedVariables extends object");
            this.separator(", ");
            t(`TDataKey extends string = T${this.operationType}Key`);
        });
        this.scope({ type: "PARAMETERS", multiLines: true }, () => {
            t("name: string");
            this.separator(", ");
            t("args: ");
            this.scope({ type: "BLOCK", multiLines: true }, () => {
                t(`readonly ${this.operationType.toLowerCase()}Key: T${this.operationType}Key,\n`);
                t(`readonly fetcher: Fetcher<${this.operationType}FetchableTypes[T${this.operationType}Key], T, TUnresolvedVariables>,\n`);
                t("readonly dataKey?: TDataKey\n");
            });
        });
        t(`: Relay${this.operationType}`);
        this.scope({ type: "GENERIC", multiLines: true, suffix: ";\n" }, () => {
            t(`Record<TDataKey, ${this.operationType}FetchedTypes<T>[T${this.operationType}Key]>`);
            this.separator(", ");
            t(`${this.operationType}Variables[T${this.operationType}Key] & TUnresolvedVariables`);
        });
    }
    writeSimpleOperation() {
        if (!this.hasSimpleHooks) {
            return;
        }
        const t = this.text.bind(this);
        t(`\nexport function createTyped${this.operationType}`);
        this.scope({ type: "GENERIC", multiLines: true }, () => {
            t(`T${this.operationType}Key extends Exclude<keyof ${this.operationType}Variables, keyof ${this.operationType}FetchableTypes>`);
            this.separator(", ");
            t(`TDataKey extends string = T${this.operationType}Key`);
        });
        this.scope({ type: "PARAMETERS", multiLines: true }, () => {
            t("name: string");
            this.separator(", ");
            t("args: ");
            this.scope({ type: "BLOCK", multiLines: true }, () => {
                t(`readonly ${this.operationType.toLowerCase()}Key: T${this.operationType}Key,\n`);
                t("readonly dataKey?: TDataKey\n");
            });
        });
        t(`: Relay${this.operationType}`);
        this.scope({ type: "GENERIC", multiLines: true, suffix: ";\n" }, () => {
            t(`Record<TDataKey, ${this.operationType}SimpleTypes[T${this.operationType}Key]>`);
            this.separator(", ");
            t(`${this.operationType}Variables[T${this.operationType}Key]`);
        });
    }
    writeOperationImpl() {
        const t = this.text.bind(this);
        t(`\nexport function createTyped${this.operationType}`);
        this.scope({ type: "GENERIC", multiLines: true }, () => {
            t(`T${this.operationType}Key extends keyof ${this.operationType}Variables`);
            this.separator(", ");
            t(`TDataKey extends string = T${this.operationType}Key`);
        });
        this.scope({ type: "PARAMETERS", multiLines: true }, () => {
            t("name: string");
            this.separator(", ");
            t("args: ");
            this.scope({ type: "BLOCK", multiLines: true }, () => {
                t(`readonly ${this.operationType.toLowerCase()}Key: T${this.operationType}Key,\n`);
                t(`readonly fetcher?: Fetcher<string, object, object>,\n`);
                t("readonly dataKey?: TDataKey\n");
            });
        });
        t(`: Relay${this.operationType}`);
        this.scope({ type: "GENERIC", multiLines: true }, () => {
            t(`Record<TDataKey, any>`);
            this.separator(", ");
            t(`${this.operationType}Variables[T${this.operationType}Key]`);
        });
        t(" ");
        this.scope({ type: "BLOCK", multiLines: true, suffix: "\n" }, () => {
            t(`return new Relay${this.operationType}`);
            this.scope({ type: "PARAMETERS", multiLines: true, suffix: ";\n" }, () => {
                t("name,\n");
                t(`args.${this.operationType.toLowerCase()}Key,\n`);
                t("args.dataKey,\n");
                t(`VARIABLE_TYPE_MAPS[args.${this.operationType.toLowerCase()}Key],\n`);
                t(`RESULT_PLURALS[args.${this.operationType.toLowerCase()}Key] !== undefined,\n`);
                t('args.fetcher\n');
            });
        });
    }
}
exports.RelayHookWriter = RelayHookWriter;
/*

export function loadQuery<
    TQuery extends OperationType,
    TEnvironmentProviderOptions extends EnvironmentProviderOptions = {}
>(
    environment: IEnvironment,
    preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
    variables: VariablesOf<TQuery>,
    options?: LoadQueryOptions,
    environmentProviderOptions?: TEnvironmentProviderOptions,
): PreloadedQuery<TQuery, TEnvironmentProviderOptions>;

export function usePreloadedQuery<TQuery extends OperationType>(
    gqlQuery: GraphQLTaggedNode,
    preloadedQuery: PreloadedQuery<TQuery>,
    options?: {
        UNSTABLE_renderPolicy?: RenderPolicy | undefined;
    },
): TQuery['response'];

export function createQuery<
    TQueryKey extends keyof QueryFetchableTypes,
    T extends object,
    TUnresolvedVariables extends object,
    TDataKey extends string = TQueryKey
>(
    name: string,
    args: {
        readonly queryKey: TQueryKey,
        readonly fetcher: Fetcher<QueryFetchableTypes[TQueryKey], T, TUnresolvedVariables>,
        readonly dataKey?: TDataKey
    }
): RelayQuery<
    Record<TDataKey, QueryFetchedTypes<T>[TQueryKey]>,
    QueryVariables[TQueryKey] & TUnresolvedVariables
>;
 */
