import { css } from "@emotion/css";
import { FC, memo, useCallback } from "react";
import { ModelType } from "../../../../../api/dist";
import { Dialog } from "../common/Dialog";
import { ErrorText } from "../common/ErrorText";
import { Loading } from "../common/Loading";
import { useRefetchQuries, useSimpleMutation } from "../__generated";
import { employee$ } from "../__generated/fetchers";

export const DELETED_EMPLOYEE_FETCHER =
    employee$
    .id
    .firstName
    .lastName;

export const DeleteEmployeeDialog: FC<{
    value: ModelType<typeof DELETED_EMPLOYEE_FETCHER>,
    onClose: () => void
}> = memo(({value, onClose}) => {

    const refetchQueries = useRefetchQuries();

    const [mutate, {loading, error}] = useSimpleMutation(
        "deleteEmployee",
        { 
            variables: {id: value.id},
            refetchQueries: () => refetchQueries.byTypes(employee$) 
        } 
    );

    const onDeleteClick = useCallback(async () => {
        try {
            await mutate();
        } catch (ex) {
            console.warn("Failed to delete employee", ex);
            return;
        }
        onClose
    }, [mutate, onClose]);

    return (
        <Dialog title="Are your sure">
            
            <div>
                Are you sure to remove the employee "{value.firstName} {value.lastName}"
            </div>
            { loading && <Loading title="Delete..."/> }
            { error && <ErrorText error={error}/>}
            <div className={css({textAlign: 'right'})}>
                <button disabled={loading} onClick={onDeleteClick}>Ok</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </Dialog>
    );
});