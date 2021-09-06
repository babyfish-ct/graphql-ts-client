import { css } from "@emotion/css";
import { FC, memo } from "react";
import { createTypedFragment, useTypedFragment, FragmentKeyOf } from "../__generated";
import { employee$ } from "../__generated/fetchers";

export const DEMO3_EMPLOYEE_ADVANCED_INFO_FRAGEMNT = createTypedFragment(
    "Demo3EmployeeAdvancedInfoFragment",
    employee$
    .supervisor(
        employee$.id.firstName.lastName
    )
    .subordinates(
        employee$.id.firstName.lastName
    )
);

export const EmployeeAdvancedInfo: FC<{
    info: FragmentKeyOf<typeof DEMO3_EMPLOYEE_ADVANCED_INFO_FRAGEMNT>
}> = memo(({info}) => {

    const data = useTypedFragment(DEMO3_EMPLOYEE_ADVANCED_INFO_FRAGEMNT, info);

    return (
        <div>
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
        </div>
    );
});