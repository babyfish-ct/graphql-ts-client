"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRequest = void 0;
function buildRequest(operationType, operationName, config) {
    // const parameterClause = config.variableParameterClause ?? "";
    // const argumentClause = config.variableArgumentClause ?? "";
    // if (commaCount(parameterClause) !== commaCount(argumentClause)) {
    //     throw new Error('"config.variableParameterClause" and "config.variableArgumentClause" are are inconsistent');
    // }
    // const implicitVariableMap = config.fetcher?.implicitVariableMap;
    // let allParameterClause: string;
    // let allArgumentClause: string;
    // let seperator = "";
    // if (parameterClause !== "" || (implicitVariableMap?.size ?? 0) !== 0) {
    //     allParameterClause = "(";
    //     allArgumentClause = "(";
    //     if (parameterClause !== "") {
    //         allParameterClause += parameterClause;
    //         allArgumentClause += argumentClause;
    //         seperator = ", ";
    //     }
    //     if (implicitVariableMap !== undefined) {
    //         for (const [name, type] of implicitVariableMap) {
    //             allParameterClause += `\$${name}: ${type}`;
    //             allArgumentClause += `\$${name}: ${name}`;
    //             seperator = ", ";
    //         }
    //     }
    //     allParameterClause += ")";
    //     allArgumentClause += ")";
    // } else {
    //     allParameterClause = "";
    //     allArgumentClause = "";
    // }
    // const dataKeyPrefix = ( 
    //     config.dataKey !== undefined && config.dataKey !== config.operationKey ?
    //     `${config.dataKey}: ` :
    //     ""
    // );
    // return `${operationType.toLocaleLowerCase()} ${operationName}${allParameterClause}{
    //     ${dataKeyPrefix}${config.operationKey}${allArgumentClause}
    //     ${config.fetcher?.toString() ?? ""}
    // }
    // ${config.fetcher?.toFragmentString()}`;
    throw new Error();
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
