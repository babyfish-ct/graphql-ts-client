import { css } from "@emotion/css";
import { ChangeEvent, FC, memo, useCallback, useState } from "react";
import { LABEL_CSS } from "../common/CssClasses";
import { Loading } from "../common/Loading";
import { useTypedQuery } from "../__generated";
import { DepartmentDialog } from "./DepartmentDialog";
import { DepartmentItem, DEPARTMENT_ITEM_FETCHER } from "./DepartmentItem";

export const DepartmentList: FC = memo(() => {

    const [name, setName] = useState<string>();

    const [dialog, setDialog] = useState(false);

    const { loading, error, data, refetch } = useTypedQuery(
        { queryKey: "findDepartmentsLikeName", operationName: "abc" }, 
        DEPARTMENT_ITEM_FETCHER,
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

    const onNewClick = useCallback(() => {
        setDialog(true);
    }, []);

    const onDialogClose = useCallback(() => {
        setDialog(false);
    }, []);

    return (
        <div className={css({margin: "0 1rem 0 1rem"})}>
            <h1>Department List</h1>
            <div className={css({
                margin: "1rem 0 1rem 0",
                display: "flex",
                "&>div": {
                    margin: "0 1rem 0 1rem"
                }
            })}>
                <div>
                    <span className={LABEL_CSS}>Name: </span> 
                    <input value={name ?? ''} onChange={onNameChange}/>
                </div>
                <button onClick={onRefetchClick}>Refetch</button>
            </div>
            { loading && <Loading mode="FLOAT"/> }
            { error && <div>Error</div> }
            {
                data && <div className={css({margin: "1rem 0 1rem 0"})}>
                    {data.findDepartmentsLikeName.map(department => 
                        <DepartmentItem key={department.id} department={department}/>
                    )}
                </div>
            }
            <div className={css({margin: "1rem 0 1rem 0"})}>
                <button onClick={onNewClick}>Add department</button>
                { dialog && <DepartmentDialog onClose={onDialogClose}/>}
            </div>
        </div>
    );
});