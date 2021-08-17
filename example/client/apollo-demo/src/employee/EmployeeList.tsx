import { css } from "@emotion/css";
import { ChangeEvent, FC, memo, useCallback, useState } from "react";
import { EmployeeItem, EMPLOYEE_ITEM_FETCHER } from "./EmployeeItem";
import { useTypedQuery } from "../__generated";
import { LABEL_CSS } from "../common/CssClasses";
import { Loading } from "../common/Loading";
import { EmployeeDialog } from "./EmployeeDialog";

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

    const [dialog, setDialog] = useState(false);
    const onNewClick = useCallback(() => {
        setDialog(true);
    }, []);
    const onDialogClose = useCallback(() => {
        setDialog(false);
    }, []);

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
                <div>
                    <button onClick={onRefetchClick}>Refresh</button>
                </div>
                <div>
                    <button onClick={onNewClick}>Add employee</button>
                </div>
            </div>
            { loading && <Loading mode="FLOAT"/> }
            { error && <div>Error</div> }
            {
                data && <div className={css({margin: "1rem 0 1rem 0"})}>
                    {data.findEmployees.map(employee => 
                        <EmployeeItem key={employee.id} employee={employee}/>
                    )}
                </div>
            }
            <div className={css({margin: "1rem 0 1rem 0"})}>
                <button onClick={onNewClick}>Add employee</button>
                { dialog && <EmployeeDialog onClose={onDialogClose}/>}
            </div>
        </div>
    );
});
