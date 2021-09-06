import { ParameterRef } from "graphql-ts-client-api";
import { FC, memo } from "react";
import { css } from "@emotion/css";
import { PreloadedQueryOf, createTypedQuery, useTypedPreloadedQuery } from "../__generated";
import { department$$, employee$, employeeConnection$, employeeEdge$, query$ } from "../__generated/fetchers";

export const DEMO1_EMPLOYEE_LIST_QUERY =
    createTypedQuery(
        "Demo1EmployeeListQuery",
        query$
        .findEmployees(
            employeeConnection$.edges(
                employeeEdge$.node(
                    employee$
                    .id
                    .firstName
                    .lastName
                    .department(
                        department$$,
                        options => options
                        .directive("include", { if: ParameterRef.of("includeDepartment", "Boolean!") })
                    )              
                )
            )
        )
    );

export const EmployeeList: FC<{
    queryReference: PreloadedQueryOf<typeof DEMO1_EMPLOYEE_LIST_QUERY>
}> = memo(({queryReference}) => {
    
    const data = useTypedPreloadedQuery(DEMO1_EMPLOYEE_LIST_QUERY, queryReference);

    return (
        <>
            {
                data.findEmployees.edges.map(edge => 
                    <div key={edge.node.id} className={css({
                        "&>div": {
                            borderTop: "dotted 1px gray",
                            margin: "0.5rem"
                        }
                    })}>
                        <div>
                            <span className={css({fontWeight: "bold"})}>{edge.node.firstName} {edge.node.lastName}</span>
                            {
                                edge.node.department !== undefined ?
                                <div>Belong to department '{edge.node.department.name}'</div> :
                                <div>Department is not loaded because the argument "if" of @include is false</div>
                            }
                        </div>
                    </div>
                )
            }
        </>
    );
});