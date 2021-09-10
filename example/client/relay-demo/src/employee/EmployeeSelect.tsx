import { Select } from "antd";
import { useCallback } from "react";
import { FC, memo } from "react";
import { environment } from "../common/Environment";
import { NO_DATA } from "../common/Styles";
import { createTypedQuery, loadTypedQuery, useTypedPreloadedQuery } from "../__generated";
import { employee$, employeeConnection$, employeeEdge$, query$ } from "../__generated/fetchers";

export const CONNECTION_KEY_ROOT_EMPLOYEE_OPTIONS = "RootEmployee_options";

const EMPLOYEE_OPTIONS_QUERY = createTypedQuery(
    "EmployeeOptionsQuery",
    query$
    .findEmployees(
        employeeConnection$.edges(
            employeeEdge$.node(
                employee$
                .id
                .firstName
                .lastName
            )
        ),
        options => options
        .alias("options") // Match "RootDepartment_options"
        .directive("connection", { key: CONNECTION_KEY_ROOT_EMPLOYEE_OPTIONS})
    )
);

const EMPLOYEE_OPTIONS_INITIAL_QUERY_REFERENCE = loadTypedQuery(
    environment,
    EMPLOYEE_OPTIONS_QUERY,
    { first: 100 }
);

export const EmployeeSelect: FC<{
    value?: string,
    onChange?: (value?: string) => void,
    optional?: boolean  
}> = memo(({value, onChange, optional = false}) => {

    const data = useTypedPreloadedQuery(EMPLOYEE_OPTIONS_QUERY, EMPLOYEE_OPTIONS_INITIAL_QUERY_REFERENCE);

    const onSelectChange = useCallback((v: string) => {
        if (onChange !== undefined) {
            const selectedValue = v !== "" ? v : undefined;
            if (value !== selectedValue) {
                onChange(selectedValue);
            }
        }
    }, [value, onChange]);

    return (
        <Select value={value ?? ""} onChange={onSelectChange}>
            {
                optional &&
                <Select.Option value=""><span className={NO_DATA}>--Unspecified--</span></Select.Option>
            }
            {
                data.options.edges.map(edge => 
                    <Select.Option key={edge.node.id} value={edge.node.id}>{edge.node.firstName} {edge.node.lastName}</Select.Option>
                )
            }
        </Select>
    );
});