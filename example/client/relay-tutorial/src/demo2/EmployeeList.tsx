import { css } from "@emotion/css";
import { ParameterRef } from "graphql-ts-client-api";
import { FC, memo } from "react";
import { createTypedQuery, QueryVariablesOf, useTypedLazyLoadQuery } from "../__generated";
import { department$$, employee$, query$ } from "../__generated/fetchers";

export const DEMO2_EMPLOYEE_LIST_QUERY =
    createTypedQuery(
        "Demo2EmployeeListQuery",
        query$
        .findEmployees(
            employee$
            .id
            .firstName
            .lastName
            .department(
                department$$,
                options => options
                .directive("include", { if: ParameterRef.of("includeDepartment", "Boolean!") })
            ),
            options => options.alias("returnedList")
        )
    );

export const EmployeeList: FC<{
    variables: QueryVariablesOf<typeof DEMO2_EMPLOYEE_LIST_QUERY>
}> = memo(({variables}) => {

    const data = useTypedLazyLoadQuery(DEMO2_EMPLOYEE_LIST_QUERY, variables);

    return (
        <>
            {
                data.returnedList.map(employee => 
                    <div key={employee.id} className={css({
                        "&>div": {
                            borderTop: "dotted 1px gray",
                            margin: "0.5rem"
                        }
                    })}>
                        <div>
                            <span className={css({fontWeight: "bold"})}>{employee.firstName} {employee.lastName}</span>
                            {
                                employee.department !== undefined ?
                                <div>Belong to department '{employee.department.name}'</div> :
                                <div>Department is not loaded because the argument "if" of @include is false</div>
                            }
                        </div>
                    </div>
                )
            }
        </>
    );
});