import { css } from "@emotion/css";
import { ParameterRef } from "graphql-ts-client-api";
import { FC, memo } from "react";
import { OperationVariablesOf, createTypedQuery, useTypedLazyLoadQuery } from "../__generated";
import { department$$, employee$, employeeConnection$, employeeEdge$, query$ } from "../__generated/fetchers";

export const DEMO2_EMPLOYEE_LIST_QUERY =
    createTypedQuery(
        "Demo2EmployeeListQuery",
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
            ),
            options => options.alias("returnedConnection")
        )
    );

export const EmployeeList: FC<{
    variables: OperationVariablesOf<typeof DEMO2_EMPLOYEE_LIST_QUERY>
}> = memo(({variables}) => {

    const data = useTypedLazyLoadQuery(DEMO2_EMPLOYEE_LIST_QUERY, variables);

    return (
        <>
            {
                data.returnedConnection.edges.map(edge => 
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