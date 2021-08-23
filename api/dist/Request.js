"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRequest = void 0;
function buildRequest(operationType, operationName, config) {
    var _a, _b, _c, _d, _e, _f, _g;
    const parameterClause = (_a = config.variableArgumentClause) !== null && _a !== void 0 ? _a : "";
    const argumentClause = (_b = config.variableArgumentClause) !== null && _b !== void 0 ? _b : "";
    if (commaCount(parameterClause) !== commaCount(argumentClause)) {
        throw new Error('"config.variableParameterClause" and "config.variableArgumentClause" are are inconsistent');
    }
    const implicitVariableMap = (_c = config.fetcher) === null || _c === void 0 ? void 0 : _c.implicitVariableMap;
    let allParameterClause;
    let allArgumentClause;
    let seperator = "";
    if (parameterClause !== "" || ((_d = implicitVariableMap === null || implicitVariableMap === void 0 ? void 0 : implicitVariableMap.size) !== null && _d !== void 0 ? _d : 0) !== 0) {
        allParameterClause = "(";
        allArgumentClause = "(";
        if (parameterClause !== "") {
            allParameterClause += parameterClause;
            allArgumentClause += argumentClause;
            seperator = ", ";
        }
        if (implicitVariableMap !== undefined) {
            for (const [name, type] of implicitVariableMap) {
                allParameterClause += `\$${name}: ${type}`;
                allArgumentClause += `\$${name}: ${name}`;
                seperator = ", ";
            }
        }
        allParameterClause += ")";
        allArgumentClause += ")";
    }
    else {
        allParameterClause = "";
        allArgumentClause = "";
    }
    const dataKeyPrefix = (config.dataKey !== undefined && config.dataKey !== config.operationKey ?
        `${config.dataKey}: ` :
        "");
    return `${operationType} ${operationName}${allParameterClause}{
        ${dataKeyPrefix}${config.operationKey}${allArgumentClause}
        ${(_f = (_e = config.fetcher) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : ""}
    }
    ${(_g = config.fetcher) === null || _g === void 0 ? void 0 : _g.toFragmentString()}`;
}
exports.buildRequest = buildRequest;
function commaCount(value) {
    let count = 0;
    for (let i = value.length - 1; i >= 0; --i) {
        if (value.charCodeAt(i) === COMMA_CODE) {
            ++count;
        }
    }
    return count;
}
const COMMA_CODE = ",".charCodeAt(0);
