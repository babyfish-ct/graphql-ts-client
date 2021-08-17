import { css } from "@emotion/css";
import { FC, memo, useCallback } from "react";
import { ModelType } from "graphql-ts-client-api";
import { Dialog } from "../common/Dialog";
import { ErrorText } from "../common/ErrorText";
import { Loading } from "../common/Loading";
import { useSimpleMutation } from "../__generated";
import { useDependencyManager } from "../__generated/DependencyManager";
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

    const dependencyManager = useDependencyManager();
    const [mutate, {loading, error}] = useSimpleMutation(
        "deleteEmployee",
        { 
            variables: {id: value.id},
            refetchQueries: () => {
                /*
                 * This "refetchQueries" is necesary, it cannot be replaced by "update" with "cache.evict".
                 * If you do that, you will find that "Department.avgSalary" cannot be changed.
                 */
                return dependencyManager.allResources(employee$);
            }
        }
    );

    const onDeleteClick = useCallback(async () => {
        try {
            await mutate();
        } catch (ex) {
            console.warn("Failed to delete employee", ex);
            return;
        }
        onClose();
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
                &nbsp;
                <button onClick={onClose}>Cancel</button>
            </div>
        </Dialog>
    );
});