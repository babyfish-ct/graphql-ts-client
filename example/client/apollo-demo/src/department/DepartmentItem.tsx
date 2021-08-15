import { css, cx } from "@emotion/css";
import { FC, memo, useCallback, useState } from "react";
import { ModelType } from "../../../../git/graphql-ts-client/api/dist";
import { LABEL_CSS, TAG_CSS } from "../common/CssClasses";
import { department$$, employee$$ } from "../__generated/fetchers";
import { DepartmentDeleteDialog } from "./DepartmentDeleteDialog";
import { DepartmentDialog } from "./DepartmentDialog";

export const DEPARTMENT_ITEM_FETCHER = 
    department$$
    .employees(
        employee$$
    );

export const DepartmentItem: FC<{
    department: ModelType<typeof DEPARTMENT_ITEM_FETCHER>;
}> = memo(({department}) => {

    const [dialog, setDialog] = useState<"EDIT" | "DELETE">();

    const onEditClick = useCallback(() => {
        setDialog("EDIT");
    }, []);

    const onDeleteClick = useCallback(() => {
        setDialog("DELETE");
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
                    <span className={LABEL_CSS}>Name: </span>
                    { department.name }
                </div>
                <div className={css({flex: 1, textAlign: 'right'})}>
                    <button onClick={onEditClick}>Edit</button>
                    &nbsp;
                    <button onClick={onDeleteClick}>Delete</button>
                </div>
            </div>
            <div>
                <div>
                    <span className={LABEL_CSS}>Employees: </span>
                </div>
                <div>
                    {department.employees.map(employee => 
                        <div key={employee.id} className={TAG_CSS}>
                            {employee.firstName} {employee.lastName}
                        </div>
                    )}
                </div>
            </div>
            { dialog === 'EDIT' && <DepartmentDialog value={department} onClose={onDialogClose}/> }
            { dialog === 'DELETE' && <DepartmentDeleteDialog value={department} onClose={onDialogClose}/>}
        </div>
    );
});