import { css } from "@emotion/css";
import { ParameterRef } from "graphql-ts-client-api";
import { FC, memo, useCallback } from "react";
import { createTypedFragment, FragmentKeyOf, useTypedPaginationFragment } from "../__generated";
import { department$$, employee$, employeeConnection$, employeeEdge$, query$ } from "../__generated/fetchers";


export const EMPLOYEE_PAGINATION_LIST_FRAGMENT = createTypedFragment(
    "demo5_EmployeePaginationListFragment",
    query$
    .directive("refetchable", { queryName: "RootEmployeePaginationQuery" })
    .findEmployees(
        { first: ParameterRef.of("count"), after: ParameterRef.of("cursor") },
        employeeConnection$
        .edges(
            employeeEdge$.node(
                employee$
                .id
                .firstName
                .lastName
                .gender
                .salary
                .department(
                    department$$
                )
                .supervisor(
                    employee$.id.firstName.lastName
                )
                .subordinates(
                    employee$.id.firstName.lastName
                )
            )
        ),
        options => options.directive("connection", { key: "RootEmployeeList_findEmployees" })
    )
);

export const EmployeePaginationList: FC<{
    rootData: FragmentKeyOf<typeof EMPLOYEE_PAGINATION_LIST_FRAGMENT>
}> = memo(({rootData}) => {
    
    const { data, hasNext, loadNext, isLoadingNext } = useTypedPaginationFragment(EMPLOYEE_PAGINATION_LIST_FRAGMENT, rootData);

    const onLoadNextClick = useCallback(() => {
        loadNext(5);
    }, [loadNext]);

    return (
        <>
            {
                data.findEmployees.edges.map((edge, index) => 
                    <div key={edge.node.id} className={css({
                        border: "dotted 1px gray",
                        margin: "1rem"
                    })}>
                        <div className={css({display: "flex"})}>
                            <div className={css({padding: "1rem"})}>
                                <h1>{index + 1}</h1>
                            </div>
                            <div className={css({flexGrow: 1})}>
                                <div>
                                    Name: {edge.node.firstName} {edge.node.lastName}
                                    Gender: {edge.node.gender}
                                    Salary: {edge.node.salary}
                                </div>
                                <div>
                                    Department: {edge.node.department.name}
                                </div>
                                <div>
                                    Supervisor: {
                                        edge.node.supervisor === undefined ?
                                        <span className={css({fontStyle: "italic", color: "gray"})}>No supervisor</span> :
                                        <span>{edge.node.supervisor.firstName} {edge.node.supervisor.firstName}</span>
                                    }
                                </div>
                                <div>
                                    Subordinates: {
                                        edge.node.subordinates.length === 0 ?
                                        <span className={css({fontStyle: "italic", color: "gray"})}>No subordinates</span> :
                                        <div>
                                            Subordinates: { edge.node.subordinates.map(subordinate => 
                                                <span key={subordinate.id}>
                                                    {subordinate.firstName} {subordinate.lastName}
                                                    , 
                                                </span>
                                            )}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            <hr/>
            {
                hasNext ?
                <button onClick={onLoadNextClick} disabled={isLoadingNext}>
                    { isLoadingNext ? "Loading..." : "Load more" }
                </button> :
                <span>All the data has been loaded</span>
            }
        </>
    );
});