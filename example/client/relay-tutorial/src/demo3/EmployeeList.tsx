import { css } from "@emotion/css";
import { FC, memo } from "react";
import { createTypedQuery, useTypedLazyLoadQuery } from "../__generated";
import { employee$, employeeConnection$, employeeEdge$, query$ } from "../__generated/fetchers";
import { DEMO3_EMPLOYEE_ADVANCED_INFO_FRAGEMNT, EmployeeAdvancedInfo } from "./EmployeeAdvancedInfo";
import { DEMO3_EMPLOYEE_BASIC_INFO_FRAGMENT, EmployeeBasicInfo } from "./EmployeeBasicInfo";

export const DEMO3_EMPLOYEE_LIST_QUERY = createTypedQuery(
    "Demo3EmployeeListQuery",
    query$
    .findEmployees(
        employeeConnection$.edges(
            employeeEdge$.node(
                employee$
                .id
                .on(DEMO3_EMPLOYEE_BASIC_INFO_FRAGMENT)
                .on(DEMO3_EMPLOYEE_ADVANCED_INFO_FRAGEMNT)
            )
        )
    )
);

export const EmployeeList: FC = memo(() => {

    const data = useTypedLazyLoadQuery(DEMO3_EMPLOYEE_LIST_QUERY, {});
    return (
        <>
            {
                data.findEmployees.edges.map(edge => 
                    <div key={edge.node.id} className={css({
                        borderTop: "dotted 1px gray",
                        margin: "0.5rem"
                    })}>
                        <EmployeeBasicInfo info={edge.node}/>
                        <EmployeeAdvancedInfo info={edge.node}/>
                    </div>
                )
            }
        </>
    );
});