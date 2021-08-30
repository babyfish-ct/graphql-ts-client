import { ChangeEvent, FC, memo, Suspense, useCallback, useState } from "react";
import { css } from "@emotion/css";
import { loadTypedQuery, QueryVariablesOf, useTypedQueryLoader } from "../__generated";
import { EmployeeList, DEMO1_EMPLOYEE_LIST_QUERY } from "./EmployeeList";
import { environment } from "../Environment";

const initalialQueryReference = loadTypedQuery(
    environment, 
    DEMO1_EMPLOYEE_LIST_QUERY,
    { includeDepartment: false }
);

export const Demo: FC = memo(() => {

    const [queryReference, loadQuery] = useTypedQueryLoader(DEMO1_EMPLOYEE_LIST_QUERY, initalialQueryReference);

    const [variables, setVariables] = useState<QueryVariablesOf<typeof DEMO1_EMPLOYEE_LIST_QUERY>>({ includeDepartment: false});

    const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const newVariables: QueryVariablesOf<typeof DEMO1_EMPLOYEE_LIST_QUERY> = {...variables, name: e.target.value};
        setVariables(newVariables);
        loadQuery(
            newVariables,
            { fetchPolicy: "network-only" }
        );
    }, [loadQuery, variables]);

    const onIncludeDepartentChagne = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const newVariables: QueryVariablesOf<typeof DEMO1_EMPLOYEE_LIST_QUERY> = {...variables, includeDepartment: e.target.checked};
        setVariables(newVariables);
        loadQuery(
            newVariables,
            { fetchPolicy: "network-only" }
        );
    }, [loadQuery, variables]);

    return (
        <>
            <h1>useTypedPreloadedQuery</h1>
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
            <Suspense fallback={<div>Loading employee list...</div>}>
                <EmployeeList queryReference={queryReference!}></EmployeeList>
            </Suspense>
        </>
    );
});