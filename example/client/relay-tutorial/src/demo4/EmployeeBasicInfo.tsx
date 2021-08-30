import { css } from "@emotion/css";
import { useCallback } from "react";
import { FC, memo } from "react";
import { createTypedFragment, FragmentKeyOf, useTypedRefetchableFragment } from "../__generated";
import { department$$, employee$$ } from "../__generated/fetchers";

export const DEMO4_EMPLOYEE_BASIC_INFO_FRAGMENT = createTypedFragment(
    "Demo4EmployeeBasicInfoFragment",
    employee$$
    .invisibleDirective("refetchable", { queryName: "Demo4EmployeeBasicInfoRefetchQuery" })
    .department(
        department$$
    )
);

export const EmployeeBasicInfo: FC<{
    info: FragmentKeyOf<typeof DEMO4_EMPLOYEE_BASIC_INFO_FRAGMENT>
}> = memo(({info}) => {

    const [data, refetch] = useTypedRefetchableFragment(DEMO4_EMPLOYEE_BASIC_INFO_FRAGMENT, info);

    const onRefresh = useCallback(() => {
        refetch({});
    }, [refetch]);

    return (
        <div className={css({border: "dotted 1px gray", margin: ".5rem"})}>
            Name: {data.firstName} {data.lastName}
            Gender: { data.gender}
            Salary: { data.salary }
            Departent: { data.department.name }
            <div>
                <button onClick={onRefresh}>Refresh basic information</button>
            </div>
        </div>
    );
});