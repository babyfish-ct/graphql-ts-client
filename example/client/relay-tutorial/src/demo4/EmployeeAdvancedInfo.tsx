import { css } from "@emotion/css";
import { useCallback } from "react";
import { FC, memo } from "react";
import { createTypedFragment, FragmentKeyOf, useTypedRefetchableFragment } from "../__generated";
import { employee$ } from "../__generated/fetchers";

export const DEMO4_EMPLOYEE_ADVANCED_INFO_FRAGEMNT = createTypedFragment(
    "Demo4EmployeeAdvancedInfoFragment",
    employee$
    .directive("refetchable", { queryName: "Demo4EmployeeAdvancedInfoRefetchQuery" })
    .id
    .supervisor(
        employee$.id.firstName.lastName
    )
    .subordinates(
        employee$.id.firstName.lastName
    )
);

export const EmployeeAdvancedInfo: FC<{
    info: FragmentKeyOf<typeof DEMO4_EMPLOYEE_ADVANCED_INFO_FRAGEMNT>
}> = memo(({info}) => {

    const [data, refetch] = useTypedRefetchableFragment(DEMO4_EMPLOYEE_ADVANCED_INFO_FRAGEMNT, info);

    const onRefresh = useCallback(() => {
        refetch({}, { fetchPolicy: 'network-only' });
    }, [refetch]);

    return (
        <div className={css({border: "dotted 1px gray", margin: ".5rem"})}>
            {
                data.supervisor === undefined ?
                <div className={css({fontStyle: "italic", color: "gray"})}>No supervisor</div> :
                <div>
                    Supevisor: { data.supervisor.firstName } { data.supervisor.lastName }
                </div>
            }
            {
                data.subordinates.length === 0 ?
                <div className={css({fontStyle: "italic", color: "gray"})}>No subordinates</div> :
                <div>
                    Subordinates: { data.subordinates.map(subordinate => 
                        <span key={subordinate.id}>
                            {subordinate.firstName} {subordinate.lastName}
                            , 
                        </span>
                    )}
                </div>
            }
            <div>
                <button onClick={onRefresh}>Refresh advance information</button>
            </div>
        </div>
    );
});