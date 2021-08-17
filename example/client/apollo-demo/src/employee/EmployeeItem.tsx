import { css } from "@emotion/css";
import { FC, memo, useCallback, useState } from "react";
import { ModelType } from "graphql-ts-client-api";
import { LABEL_CSS, TAG_CSS } from "../common/CssClasses";
import { department$$, employee$$ } from "../__generated/fetchers";
import { EmployeeDialog } from "./EmployeeDialog";

export const EMPLOYEE_ITEM_FETCHER = 
    employee$$
    .department(
        department$$
    )
    .supervisor(
        employee$$
    )
    .subordinates(
        employee$$
    );

export const EmployeeItem: FC<{
    employee: ModelType<typeof EMPLOYEE_ITEM_FETCHER>
}> = memo(({employee}) => {

    const [dialog, setDialog] = useState<"EDIT" | "DELETE">();

    const onEditClick = useCallback(() => {
        setDialog('EDIT');
    }, []);

    const onDeleteClick = useCallback(() => {
        setDialog('DELETE');
    }, []);

    const onDialogClose = useCallback(() => {
        setDialog(undefined);
    }, []);

    return (
        <div className={css({
            border: "solid 1px lightgray",
            borderRadius: ".5rem",
            margin: ".5rem 0 .5rem 0",
            padding: ".5rem",
            "&>div": {
                display: "flex",
                "&>div": {
                    margin: "0 .5rem 0 .5rem"
                }
            }
        })}>
            <div>
                <div>
                    <span className={LABEL_CSS}>FirstName: </span>
                    { employee.firstName }
                </div>
                <div>
                    <span className={LABEL_CSS}>LastName: </span>
                    { employee.lastName }
                </div>
                <div>
                    <span className={LABEL_CSS}>Gender: </span>
                    { employee.gender }
                </div>
                <div className={css({
                    flex: 1,
                    textAlign: "right"   
                })}>
                    <button onClick={onEditClick}>Edit</button>
                    <button onClick={onDeleteClick}>Delete</button>
                </div>
            </div>
            <div>
                <div>
                    <span className={LABEL_CSS}>Department: </span>
                </div>
                <div>
                    <div className={TAG_CSS}>{employee.department.name}</div>
                </div>
            </div>
            <div>
                <div>
                    <span className={LABEL_CSS}>Supervisor: </span>
                </div>
                <div>
                    {
                        employee.supervisor && 
                        <div className={TAG_CSS}>
                            {employee.supervisor.firstName} {employee.supervisor.lastName}
                        </div>
                    }    
                </div>
            </div>
            <div>
                <div>
                    <span className={LABEL_CSS}>Salary</span>
                </div>
                <div>
                    {employee.salary}
                </div>
            </div>
            <div>
                <div>
                    <span className={LABEL_CSS}>Subordinates: </span>    
                </div>
                <div>
                    {
                        employee.subordinates.map(subordinate => 
                            <div key={subordinate.id} className={TAG_CSS}>
                                {subordinate.firstName} {subordinate.lastName}
                            </div>
                        )
                    }
                </div>
            </div>
            { dialog === 'EDIT' && <EmployeeDialog value={employee} onClose={onDialogClose}/> }
        </div>
    );
})