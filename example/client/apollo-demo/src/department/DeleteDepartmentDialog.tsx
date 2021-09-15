import { css } from "@emotion/css";
import { FC, memo, useCallback } from "react";
import { ModelType } from "graphql-ts-client-api";
import { Dialog } from "../common/Dialog";
import { ErrorText } from "../common/ErrorText";
import { Loading } from "../common/Loading";
import { department$, mutation$ } from "../__generated/fetchers";
import { useTypedMutation, useDependencyManager } from "../__generated";

const DELETED_DEPARTMENT_FETCHER =
    department$
    .id
    .name;

export const DeleteDepartmentDialog: FC<{
    value: ModelType<typeof DELETED_DEPARTMENT_FETCHER>,
    onClose: () => void
}> = memo(({value, onClose}) => {

    const dependencyManager = useDependencyManager();
    const [mutate, {loading, error}] = useTypedMutation(
        mutation$.deleteDepartment(),
        { 
            variables: { id: value.id },
            refetchQueries: () => {
                /*
                 * 1. If serve side supports cascade deletation on the one-to-many assocation "department.employees",
                 * change the argument to "department$.employees(employee$)"
                 * 
                 * 2. Now, the server-side does not supports cascade deletation,
                 * so this is a simple deleting operation and you can remove this "refetchQuires" 
                 * and add "update" with "cache.evict" to optimize the performance.
                 */
                return dependencyManager.allResources(department$);
            }
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