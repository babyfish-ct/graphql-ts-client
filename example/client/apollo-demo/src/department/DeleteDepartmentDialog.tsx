import { css } from "@emotion/css";
import { FC, memo, useCallback } from "react";
import { ModelType } from "graphql-ts-client-api";
import { Dialog } from "../common/Dialog";
import { ErrorText } from "../common/ErrorText";
import { Loading } from "../common/Loading";
import { useRefetchQuries, useSimpleMutation } from "../__generated";
import { department$ } from "../__generated/fetchers";

const DELETED_DEPARTMENT_FETCHER =
    department$
    .id
    .name;

export const DeleteDepartmentDialog: FC<{
    value: ModelType<typeof DELETED_DEPARTMENT_FETCHER>,
    onClose: () => void
}> = memo(({value, onClose}) => {

    const refetchQueries = useRefetchQuries();
    
    const [mutate, {loading, error}] = useSimpleMutation(
        "deleteDepartment", 
        { 
            variables: { id: value.id },
            refetchQueries: () => refetchQueries.byTypes(department$)
        }
    );

    const onDeleteClick = useCallback(async () => {
        try {
            await mutate();
            onClose();
        } catch (ex) {
            console.warn("Failed to delete department", ex);
        }
    }, [mutate, onClose]);

    return (
        <Dialog title="Are you sure">
            <div>
                Are your shared to delete the department "{value.name}"?
            </div>
            { loading && <Loading title="Deleting..."/> }
            { error && <ErrorText error={error}/> }
            <div className={css({textAlign: "right"})}>
                <button onClick={onDeleteClick} disabled={loading}>Ok</button>
                &nbsp;
                <button onClick={onClose}>Cancel</button>
            </div>
        </Dialog>
    );
});