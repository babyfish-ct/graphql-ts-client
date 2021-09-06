import { FC, memo, Suspense } from "react";
import { createTypedQuery, useTypedLazyLoadQuery } from "../__generated";
import { query$ } from "../__generated/fetchers";
import { EmployeePaginationList, EMPLOYEE_PAGINATION_LIST_FRAGMENT } from "./EmployeePaginationList";

const EMPLOYEE_PAGINATION_LIST_QUERY = createTypedQuery(
    "demo5_EmployeePaginationListQuery",
    query$.on(
        EMPLOYEE_PAGINATION_LIST_FRAGMENT
    )
)
export const Demo: FC = memo(() => {

    const data = useTypedLazyLoadQuery(EMPLOYEE_PAGINATION_LIST_QUERY, { count: 5, cursor: undefined } );

    return (
        <>
            <h1>useTypedPaginationFragment</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <EmployeePaginationList rootData={data}/>
            </Suspense>
        </>
    );
});