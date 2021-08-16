import { css } from "@emotion/css";
import { ChangeEvent, FC, memo, useCallback, useMemo, useState } from "react";
import UUIDClass from "uuidjs";
import { ModelType } from "../../../../../api/dist";
import { ERROR_CSS, FORM_CSS } from "../common/CssClasses";
import { Dialog } from "../common/Dialog";
import { ErrorText } from "../common/ErrorText";
import { Loading } from "../common/Loading";
import { DepartmentSelect } from "../department/DepartmentSelect";
import { useRefetchQuries, useTypedMutation } from "../__generated";
import { department$, employee$, employee$$ } from "../__generated/fetchers";
import { EmployeeInput } from "../__generated/inputs";

export const EMPLOYEE_FORM_FETCHER =
    employee$$
    .department(department$.id)
    .supervisor(employee$.id);

export const EmployeeDialog: FC<{
    value?: ModelType<typeof EMPLOYEE_FORM_FETCHER>,
    onClose: () => void
}> = memo(({value, onClose}) => {

    const [input, setInput] = useState<Partial<EmployeeInput>>(() => {
        if (value === undefined) {
            return { 
                id: UUIDClass.generate(), 
                gender: 'MALE',
                salary: 0, 
            }
        }
        return {
            id: value.id,
            firstName: value.firstName,
            lastName: value.lastName,
            gender: value.gender,
            salary: value.salary,
            departmentId: value.department.id,
            supervisorId: value.supervisor?.id
        };
    });

    const valid = useMemo<boolean>(() => {
        return input.firstName !== undefined && input.lastName !== undefined && input.departmentId !== undefined;
    }, [input]);

    const refetchQueries = useRefetchQuries();
    
    const [mutate, {loading, error}] = useTypedMutation(
        "mergeEmployee",
        employee$$
        .department(department$.id)
        .supervisor(employee$.id),
        {
            variables: { input: input as EmployeeInput }, // Unsafe cast, depends on "valid"
            refetchQueries: () => {
                return [

                    // If create new object(value === undefined), refresh all the related quires
                    // Otherwise, apollo automactically uses the returned object to update cache.
                    ...refetchQueries.byTypes(employee$, "DIRECT", value === undefined),

                    // Employee.salary affects Department.avgSalary
                    //...refetchQueries.byFields(employee$.salary),
                ];
            }
        }
    );

    const onFirstNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(old => ({...old, firstName: value === '' ? undefined : value}));
    }, []);

    const onLastNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(old => ({...old, lastName: value === '' ? undefined : value}));
    }, []);

    const onGenderChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setInput(old => ({...old, gender: e.target.value === 'FEMALE' ? 'FEMALE' : 'MALE'}));
    }, []);

    const onDepartmentIdChange = useCallback((departmentId?: string) => {
        if (departmentId !== undefined) {
            setInput(old => ({...old, departmentId}));
        }
    }, []);

    const onSaveClick = useCallback(async () => {
        if (valid) {
            try {
                await mutate();
            } catch (ex) {
                console.warn("Failed to save employee", ex);
                return;
            }
            onClose();
        }
    }, [mutate, valid, onClose]);

    return (
        <Dialog title={`${value === undefined ? 'Create' : 'Edit'} employee`}>
            <div className={FORM_CSS}>
                <div>
                    <div>FirstName: </div>
                    <div><input value={input.firstName ?? ''} onChange={onFirstNameChange}/></div>
                    { input.firstName === undefined && <div className={ERROR_CSS}>Please enter first name</div> }
                </div>
                <div>
                    <div>LastName: </div>
                    <div><input value={input.lastName ?? ''} onChange={onLastNameChange}/></div>
                    { input.lastName === undefined && <div className={ERROR_CSS}>Please enter last name</div> }
                </div>
                <div>
                    <div>Gender: </div>
                    <div>
                        <select value={input.gender ?? 'MALE'} onChange={onGenderChange}>
                            <option value='MALE'>Male</option>
                            <option value='FEMALE'>Female</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div>Department: </div>
                    <div>
                        <DepartmentSelect value={input.departmentId} onChange={onDepartmentIdChange}/>
                    </div>
                    { input.departmentId === undefined && <div className={ERROR_CSS}>Please select department</div> }
                </div>
            </div>
            { loading && <Loading title="Saving..."/> }
            { error && <ErrorText error={error}/>}
            <div className={css({textAlign: 'right'})}>
                <button disabled={!valid || loading} onClick={onSaveClick}>Ok</button>
                &nbsp;
                <button onClick={onClose}>Cancel</button>
            </div>
        </Dialog>
    );
});