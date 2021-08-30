import { FC, memo } from "react";
import { createTypedFragment, FragmentKeyOf, useTypedFragment } from "../__generated";
import { department$$, employee$$ } from "../__generated/fetchers";

export const DEMO3_EMPLOYEE_BASIC_INFO_FRAGMENT = createTypedFragment(
    "Demo3EmployeeBasicInfoFragment",
    employee$$
    .department(
        department$$
    )
);

export const EmployeeBasicInfo: FC<{
    info: FragmentKeyOf<typeof DEMO3_EMPLOYEE_BASIC_INFO_FRAGMENT>
}> = memo(({info}) => {

    const data = useTypedFragment(DEMO3_EMPLOYEE_BASIC_INFO_FRAGMENT, info);

    return (
        <div>
            Name: {data.firstName} {data.lastName}
            Gender: { data.gender}
            Salary: { data.salary }
            Departent: { data.department.name }
        </div>
    );
});