import { Fetcher } from "./Fetcher";

export function buildRequest(
    operationType: "Query" | "Mutation",
    operationName: string,
    config: RequestConfig
): string {
    
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

export interface RequestConfig {
    readonly operationKey: string;
    readonly dataKey?: string;
    readonly fetcher?: Fetcher<string, object, object>;
    readonly variableParameterClause?: string;
    readonly variableArgumentClause?: string;
}

function commaCount(value: string): number {
    let count = 0;
    for (let i = value.length - 1; i >= 0; --i) {
        if (value.charCodeAt(i) === COMMA_CODE) {
            ++count;
        }
    }
    return count;
}

const COMMA_CODE = ",".charCodeAt(0);