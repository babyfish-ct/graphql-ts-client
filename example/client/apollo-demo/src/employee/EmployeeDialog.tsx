import { css } from "@emotion/css";
import { ChangeEvent, FC, memo, useCallback, useMemo, useState } from "react";
import UUIDClass from "uuidjs";
import { ModelType } from "graphql-ts-client-api";
import { ERROR_CSS, FORM_CSS } from "../common/CssClasses";
import { Dialog } from "../common/Dialog";
import { ErrorText } from "../common/ErrorText";
import { Loading } from "../common/Loading";
import { DepartmentSelect } from "../department/DepartmentSelect";
import { useTypedMutation } from "../__generated";
import { department$, employee$, employee$$, mutation$ } from "../__generated/fetchers";
import { EmployeeInput } from "../__generated/inputs";
import { EmployeeSelect } from "./EmployeeSelect";

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

    const [mutate, {loading, error}] = useTypedMutation(
        mutation$.mergeEmployee(
        EMPLOYEE_FORM_FETCHER // Mutation Fetcher
        ),
        {
            variables: { input: input as EmployeeInput }, // Unsafe cast, depends on "valid"
            
            refetchDependencies: result => {

                if (result.errors) { 
                    // Refetch all the affected queries becasue error means client does not know whether server side has done the mutation or not.
                    return result.dependencies.ofError(); 
                }

                /*
                 * 1. The mutation fetcher 'EMPLOYEE_FORM_FETCHER' contains the assocation field 'Employee.department', 
                 * so DependencyManager will compare the departments of the old object(value) and new object(result.data?.mergeEmployee).
                 * If that association field has been changed, all the affected queries will be refetched, 
                 * For example, other queries returns Department objects with field 'employees'
                 * 
                 * 2. The mutation fetcher 'EMPLOYEE_FORM_FETCHER' contains the assocation field 'Employee.supervisor',
                 * so DependencyManager will compare the supervisors of the old object(value) and new object(result.data?.mergeEmployee).
                 * If that association field has been changed, all the affected queries will be refetched, 
                 * For example, other queries returns Employee objects with field 'subordinates'
                 * 
                 * 3. The mutation fetcher 'EMPLOYEE_FORM_FETCHER' contains the scalar field 'Employee.scalar'
                 * so DependencyManager will compare the salaries of the old object(value) and new object(result.data?.mergeEmployee).
                 * If that scalar field has been changed, all the affected queries will be refetched, 
                 * For example, other queries returns Department objects with field 'avgSalary'
                 * 
                 * 4. If the mutation added an new employee('value' is undefined but 'result.data?.mergeEmployee' is not),
                 * Refetchs all the queries returns 'Employee' and execute 1, 2 and 3.
                 */
                return result.dependencies.ofData(
                    value === undefined ? undefined : { mergeEmployee: value }, 
                    result.data
                );
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
            setInput(old => ({...old, departmentId, supervisorId: undefined}));
        }
    }, []);
    const onSupervisorIdChange = useCallback((supervisorId?: string) => {
        setInput(old => ({...old, supervisorId}));
    }, []);
    const onSalaryChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setInput(old => ({...old, salary: e.target.valueAsNumber}));
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
                {
                    input.departmentId && <div>
                        <div>Supervisor: </div>
                        <div>
                            <EmployeeSelect 
                            optional
                            departmentId={input.departmentId}
                            value={input.supervisorId} 
                            onChange={onSupervisorIdChange}/>
                        </div>
                    </div>
                }
                <div>
                    <div>Salary</div>
                    <input type="number" value={input.salary ?? 0} onChange={onSalaryChange}/>
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