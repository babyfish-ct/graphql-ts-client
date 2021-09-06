"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTypedRefetchableFragment = exports.useTypedFragment = exports.useTypedMutation = exports.useTypedLazyLoadQuery = exports.useTypedPreloadedQuery = exports.useTypedQueryLoader = exports.fetchTypedQuery = exports.loadTypedQuery = void 0;
const react_1 = require("react");
const graphql_ts_client_api_1 = require("graphql-ts-client-api");
const react_relay_1 = require("react-relay");
const relay_runtime_1 = require("relay-runtime");
function loadTypedQuery(environment, query, variables, options, environmentProviderOptions) {
    return react_relay_1.loadQuery(environment, query.taggedNode, variables, options, environmentProviderOptions);
}
exports.loadTypedQuery = loadTypedQuery;
function fetchTypedQuery(environment, query, variables, cacheConfig) {
    return relay_runtime_1.fetchQuery(environment, query.taggedNode, variables, cacheConfig);
}
exports.fetchTypedQuery = fetchTypedQuery;
function useTypedQueryLoader(query, initialQueryReference) {
    return react_relay_1.useQueryLoader(query.taggedNode, initialQueryReference);
}
exports.useTypedQueryLoader = useTypedQueryLoader;
function useTypedPreloadedQuery(query, preloadedQuery, options) {
    const response = react_relay_1.usePreloadedQuery(query.taggedNode, preloadedQuery, options);
    return react_1.useMemo(() => {
        return graphql_ts_client_api_1.util.exceptNullValues(response);
    }, [response]);
}
exports.useTypedPreloadedQuery = useTypedPreloadedQuery;
function useTypedLazyLoadQuery(query, variables, options) {
    const response = react_relay_1.useLazyLoadQuery(query.taggedNode, variables, options);
    return react_1.useMemo(() => {
        return graphql_ts_client_api_1.util.exceptNullValues(response);
    }, [response]);
}
exports.useTypedLazyLoadQuery = useTypedLazyLoadQuery;
function useTypedMutation(mutation, commitMutationFn) {
    return react_relay_1.useMutation(mutation.taggedNode, commitMutationFn);
}
exports.useTypedMutation = useTypedMutation;
function useTypedFragment(fragment, fragmentRef) {
    const data = react_relay_1.useFragment(fragment.taggedNode, fragmentRef !== null && fragmentRef !== void 0 ? fragmentRef : null);
    return react_1.useMemo(() => {
        return graphql_ts_client_api_1.util.exceptNullValues(data);
    }, [data]);
}
exports.useTypedFragment = useTypedFragment;
function useTypedRefetchableFragment(fragment, fragmentRef) {
    const tuple = react_relay_1.useRefetchableFragment(fragment.taggedNode, fragmentRef !== null && fragmentRef !== void 0 ? fragmentRef : null);
    return react_1.useMemo(() => {
        return [
            graphql_ts_client_api_1.util.exceptNullValues(tuple[0]),
            tuple[1]
        ];
    }, [tuple]);
}
exports.useTypedRefetchableFragment = useTypedRefetchableFragment;
