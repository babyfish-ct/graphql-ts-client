import { css } from "@emotion/css";
import { ChangeEvent, FC, memo, useCallback, useState } from "react";
import { EmployeeItem, EMPLOYEE_ITEM_FETCHER } from "./EmployeeItem";
import { useTypedQuery } from "../__generated";
import { LABEL_CSS } from "../common/CssClasses";
import { Loading } from "../common/Loading";
import { EmployeeDialog } from "./EmployeeDialog";
import { DepartmentSelect } from "../department/DepartmentSelect";
import { EmployeeSelect } from "./EmployeeSelect";
import { employeeConnection$, employeeEdge$, pageInfo$$, query$ } from "../__generated/fetchers";

export const EmployeeList: FC = memo(() => {

    const [name, setName] = useState<string>();
    const [departmentId, setDepartmentId] = useState<string>();
    const [supervisorId, setSupervisorId] = useState<string>();

    const [paginationDirection, setPaginationDirection] = useState<"next" | "prev">("next");
    const [paginationCursor, setPaginationCursor] = useState<string>();

    const { loading, error, data, refetch } = useTypedQuery(
        query$.findEmployees(
            employeeConnection$
            .edges(
                employeeEdge$.node(
                    EMPLOYEE_ITEM_FETCHER
                )
            )
            .pageInfo(
                pageInfo$$
            )
        ),
        {
            notifyOnNetworkStatusChange: true, // consider "refetching" as "loading"
            variables: { 
                name,
                departmentId,
                supervisorId,
                [paginationDirection === 'next' ? "first" : "last"]: 4,
                [paginationDirection === 'next' ? "after" : "before"]: paginationCursor
            }
        }
    );

    const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value.trim();
        setName(name === "" ? undefined : name);
        setPaginationDirection("next");
        setPaginationCursor(undefined);
    }, []);

    const onDepartmentIdChange = useCallback((value?: string) => {
        setDepartmentId(value);
        setPaginationDirection("next");
        setPaginationCursor(undefined);
    }, []);

    const onSupervsiorIdChange = useCallback((value?: string) => {
        setSupervisorId(value);
        setPaginationDirection("next");
        setPaginationCursor(undefined);
    }, []);

    const onRefetchClick = useCallback(() => {
        refetch();
    }, [refetch]);

    const [dialog, setDialog] = useState(false);

    const onPrevPageClick = useCallback(() => {
        if (data?.findEmployees.pageInfo.hasPreviousPage) {
            setPaginationDirection("prev");
            setPaginationCursor(data.findEmployees.pageInfo.startCursor);
        }
    }, [data]);

    const onNextPageClick = useCallback(() => {
        if (data?.findEmployees.pageInfo.hasNextPage) {
            setPaginationDirection("next");
            setPaginationCursor(data.findEmployees.pageInfo.endCursor);
        }
    }, [data]);

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
                flexWrap: "wrap",
                "&>div": {
                    padding: ".5rem"
                }
            })}>
                <div>
                    <span className={LABEL_CSS}>Name: </span> 
                    <input value={name ?? ''} onChange={onNameChange}/>
                </div>
                <div>
                    <span className={LABEL_CSS}>Department: </span>
                    <DepartmentSelect optional value={departmentId} onChange={onDepartmentIdChange}/>
                </div>
                <div>
                    <span className={LABEL_CSS}>Supervisor: </span>
                    <EmployeeSelect optional value={supervisorId} onChange={onSupervsiorIdChange}/>
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
                    {data.findEmployees.edges.map(edge => 
                        <EmployeeItem key={edge.node.id} employee={edge.node}/>
                    )}
                </div>
            }
            {
                data &&
                <div className={css({margin: "1rem 0 1rem 0"})}>
                    <button 
                    disabled={loading || !data.findEmployees.pageInfo.hasPreviousPage}
                    onClick={onPrevPageClick}>
                        &lt;Prev page
                    </button>
                    &nbsp;
                    <button 
                    disabled={loading || !data.findEmployees.pageInfo.hasNextPage}
                    onClick={onNextPageClick}>
                        Next Page&gt;
                    </button>
                    &nbsp;
                    <button onClick={onNewClick}>Add employee</button>
                    { dialog && <EmployeeDialog onClose={onDialogClose}/>}
                </div>
            }
        </div>
    );
});
