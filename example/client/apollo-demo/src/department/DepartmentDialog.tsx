import { css } from "@emotion/css";
import { ChangeEvent, FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import UUIDClass from "uuidjs";
import { ModelType } from "../../../../git/graphql-ts-client/api/dist";
import { ERROR_CSS, FORM_CSS } from "../common/CssClasses";
import { Dialog } from "../common/Dialog";
import { Loading } from "../common/Loading";
import { useTypedMutation } from "../__generated";
import { department$$ } from "../__generated/fetchers";
import { DepartmentInput } from "../__generated/inputs";
import { DEPARTMENT_ITEM_FETCHER } from "./DepartmentItem";

export const DepartmentDialog: FC<{
    value?: ModelType<typeof DEPARTMENT_ITEM_FETCHER>,
    onClose: () => void
}> = memo(({value, onClose}) => {

    const [input, setInput] = useState<Partial<DepartmentInput>>(() => {
        if (value === undefined) {
            return { id: UUIDClass.generate() };
        } 
        return {
            id: value.id,
            name: value.name
        }
    });

    const valid = useMemo<boolean>(() => {
        return input.id !== undefined && input.name !== undefined
    }, [input]);

    const [mutate, { loading, error }] = useTypedMutation(
        "mergeDepartment",
        department$$,
        { 
            variables: {input: input as DepartmentInput} // Unsafe cast, depends on "valid" 
        }
    );

    const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value.trim();
        setInput(old => ({...old, name: name === "" ? undefined : name}));
    }, []);

    const onSaveClick = useCallback(async () => {
        if (valid) {
            try {
                await mutate();
                onClose();
            } catch (ex) {
                console.warn("Failed to merge department", ex);
            }
        }
    }, [valid, mutate, onClose]);

    return (
        <Dialog title={`${value === undefined ? "Create" : "Modify"} department`}>
            <div className={FORM_CSS}>
                <div>
                    <div>Name: </div>
                    <div><input value={input.name} onChange={onNameChange}/></div>
                    {input.name === undefined && <div className={ERROR_CSS}>Please input name</div> }
                </div>
            </div>
            { loading && <Loading title="Saving..." mode="INLINE"/> }
            { error && <div>Error</div> }
            <div className={css({textAlign: "right"})}>
                <button onClick={onSaveClick} disabled={!valid}>Ok</button>
                &nbsp;
                <button onClick={onClose}>Cancel</button>
            </div>
        </Dialog>
    );
});