import { css } from "@emotion/css";
import { FC, memo, Suspense } from "react";
import { createTypedQuery, useTypedLazyLoadQuery } from "../__generated";
import { employee$, query$ } from "../__generated/fetchers";
import { DEMO4_EMPLOYEE_ADVANCED_INFO_FRAGEMNT, EmployeeAdvancedInfo } from "./EmployeeAdvancedInfo";
import { DEMO4_EMPLOYEE_BASIC_INFO_FRAGMENT, EmployeeBasicInfo } from "./EmployeeBasicInfo";

export const DEMO4_EMPLOYEE_LIST_QUERY = createTypedQuery(
    "Demo4EmployeeListQuery",
    query$
    .findEmployees(
        employee$
        .id
        .on(DEMO4_EMPLOYEE_BASIC_INFO_FRAGMENT)
        .on(DEMO4_EMPLOYEE_ADVANCED_INFO_FRAGEMNT)
    )
);

export const EmployeeList: FC = memo(() => {

    const data = useTypedLazyLoadQuery(DEMO4_EMPLOYEE_LIST_QUERY, {});
    return (
        <>
            {
                data.findEmployees.map(employee => 
                    <div key={employee.id} className={css({
                        border: "dotted 1px gray",
                        margin: "1rem"
                    })}>
                        <Suspense fallback={<div className={css({color: "red"})}>Refresh basic information</div>}>
                            <EmployeeBasicInfo info={employee}/>
                        </Suspense>
                        <Suspense fallback={<div className={css({color: "red"})}>Refresh advanced information</div>}>
                            <EmployeeAdvancedInfo info={employee}/>
                        </Suspense>
                    </div>
                )
            }
        </>
    );
});