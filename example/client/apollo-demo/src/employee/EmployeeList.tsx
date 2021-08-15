import { css } from "@emotion/css";
import { ChangeEvent, FC, memo, useCallback, useState } from "react";
import { EmployeeItem, EMPLOYEE_ITEM_FETCHER } from "./EmployeeItem";
import { useTypedQuery } from "../__generated";
import { LABEL_CSS } from "../common/CssClasses";
import { Loading } from "../common/Loading";

export const EmployeeList: FC = memo(() => {

    const [name, setName] = useState<string>();

    const { loading, error, data, refetch } = useTypedQuery(
        "findEmployees",
        EMPLOYEE_ITEM_FETCHER,
        {
            notifyOnNetworkStatusChange: true, // consider "refetching" as "loading"
            variables: { name }
        }
    );

    const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value.trim();
        setName(name === "" ? undefined : name);
    }, []);

    const onRefetchClick = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <div className={css({margin: "0 1rem 0 1rem"})}>
            <h1>EmployeeList</h1>
            <div className={css({
                margin: "1rem 0 1rem 0",
                display: "flex",
                "&>div": {
                    margin: "0 1rem 0 1rem"
                }
            })}>
                <div>
                    <span className={LABEL_CSS}>Name: </span> 
                    <input value={name} onChange={onNameChange}/>
                </div>
                <button onClick={onRefetchClick}>Refresh</button>
            </div>
            { loading && <Loading/> }
            { error && <div>Error</div> }
            {
                data && <div className={css({margin: "1rem 0 1rem 0"})}>
                    {data.findEmployees.map(employee => 
                        <EmployeeItem key={employee.id} employee={employee}/>
                    )}
                    { loading && <div className="loading-mask"></div>}
                </div>
            }
        </div>
    );
});
