import { FC, memo } from "react";
import { useFragmentRefresher } from "../common/RefreshFragment";
import { createTypedFragment, FragmentKeyOf, useTypedRefetchableFragment } from "../__generated";
import { department$ } from "../__generated/fetchers";
import { REASON_COMPUTED_AVG_SALARY } from "../common/RefreshFragmentReason";

export const AVG_SALARY_FRAGMENT = createTypedFragment(
    "AvgSalaryFragment",
    department$
    .directive("refetchable", { queryName: "AvgSalaryRefetchQuery" })
    .id
    .avgSalary
);

export const AvgSalaryText: FC<{
    department: FragmentKeyOf<typeof AVG_SALARY_FRAGMENT>
}> = memo(({department}) => {

    const [data, refetch] = useTypedRefetchableFragment(AVG_SALARY_FRAGMENT, department);

    useFragmentRefresher(data.id, REASON_COMPUTED_AVG_SALARY, refetch);

    return (
        <span>{data.avgSalary}+</span>
    );
});