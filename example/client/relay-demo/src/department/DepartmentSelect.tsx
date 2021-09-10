import { Select } from "antd";
import { useCallback } from "react";
import { FC, memo } from "react";
import { environment } from "../common/Environment";
import { NO_DATA } from "../common/Styles";
import { createTypedQuery, loadTypedQuery, useTypedPreloadedQuery } from "../__generated";
import { department$$, departmentConnection$, departmentEdge$, query$ } from "../__generated/fetchers";

export const CONNECTION_KEY_ROOT_DEPARTMENT_OPTIONS = "RootDepartment_options";

const DEPARTMENT_OPTIONS_QUERY = createTypedQuery(
    "DepartmentOptionsQuery",
    query$
    .findDepartmentsLikeName(
        departmentConnection$.edges(
            departmentEdge$.node(
                department$$
            )
        ),
        options => options
        .alias("options") // Match "RootDepartment_options"
        .directive("connection", { key: CONNECTION_KEY_ROOT_DEPARTMENT_OPTIONS })
    )
);

const DEPARTMENT_OPTIONS_INITIAL_QUERY_RERFENCE = loadTypedQuery(
    environment,
    DEPARTMENT_OPTIONS_QUERY,
    { first: 100 }
);

export const DepartmentSelect: FC<{
    value?: string,
    onChange?: (value?: string) => void,
    optional?: boolean  
}> = memo(({value, onChange, optional = false}) => {

    const data = useTypedPreloadedQuery(DEPARTMENT_OPTIONS_QUERY, DEPARTMENT_OPTIONS_INITIAL_QUERY_RERFENCE);

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
                    <Select.Option key={edge.node.id} value={edge.node.id}>{edge.node.name}</Select.Option>
                )
            }
        </Select>
    );
});