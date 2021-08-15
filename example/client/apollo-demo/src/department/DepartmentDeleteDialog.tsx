import { css } from "@emotion/css";
import { FC, memo, useCallback } from "react";
import { ModelType } from "../../../../git/graphql-ts-client/api/dist";
import { Dialog } from "../common/Dialog";
import { ErrorText } from "../common/ErrorText";
import { Loading } from "../common/Loading";
import { useSimpleMutation } from "../__generated";
import { DEPARTMENT_ITEM_FETCHER } from "./DepartmentItem";

export const DepartmentDeleteDialog: FC<{
    value: ModelType<typeof DEPARTMENT_ITEM_FETCHER>,
    onClose: () => void
}> = memo(({value, onClose}) => {

    const [mutate, {loading, error}] = useSimpleMutation(
        "deleteDepartment", 
        { variables: { id: value.id } }
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
            Are your shared to delete the department "{value.name}"?
            { loading && <Loading title="Deleting..." mode = "INLINE"/> }
            { error && <ErrorText error={error}/> }
            <div className={css({textAlign: "right"})}>
                <button onClick={onDeleteClick}>Ok</button>
                &nbsp;
                <button onClick={onClose}>Cancel</button>
            </div>
        </Dialog>
    );
});