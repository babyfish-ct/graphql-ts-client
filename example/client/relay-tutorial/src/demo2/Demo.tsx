import { css } from "@emotion/css";
import { ChangeEvent, FC, memo, Suspense, useCallback, useState } from "react";
import { DEMO2_EMPLOYEE_LIST_QUERY } from "./EmployeeList";
import { EmployeeList } from "../demo2/EmployeeList";
import { OperationVariablesOf } from "../__generated";

export const Demo: FC = memo(() => {

    const [variables, setVariables] = useState<OperationVariablesOf<typeof DEMO2_EMPLOYEE_LIST_QUERY>>({ includeDepartment: false});

    const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setVariables(old => ({...old, name: e.target.value}));
    }, []);

    const onIncludeDepartentChagne = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setVariables(old => ({...old, includeDepartment: e.target.checked}));
    }, []);

    return (
        <>
            <h1>useTypedLazyQuery</h1>
            <div className={css({
                "&>div": {
                    margin: "0.5rem",
                    display: "flex",
                    "&>div": {
                        padding: "0.5rem"
                    },
                    "&>div.label": {
                        width: "200px"
                    }
                }
            })}>
                <div>
                    <div className="label">Name</div>
                    <div><input value={variables?.name ?? ""} onChange={onNameChange}/></div>
                </div>
                <div>
                    <div className="label">Include department</div>
                    <div><input type="checkbox" value={variables.includeDepartment} onChange={onIncludeDepartentChagne}/></div>
                </div>
            </div>
            <Suspense fallback={<div>Loading employee list</div>}>
                <EmployeeList variables={variables}/>
            </Suspense>
        </>
    );
});
