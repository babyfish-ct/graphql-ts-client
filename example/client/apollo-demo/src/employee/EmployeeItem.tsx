import { css, cx } from "@emotion/css";
import { ChangeEvent, FC, memo, useCallback, useState } from "react";
import { ModelType } from "../../../../git/graphql-ts-client/api/dist";
import { LABEL_CSS, TAG_CSS } from "../common/CssClasses";
import { Gender } from "../__generated/enums";
import { department$$, employee$$ } from "../__generated/fetchers";
import { EmployeeInput } from "../__generated/inputs";

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

    const [input, setInput] = useState<EmployeeInput>();

    const onEditClick = useCallback(() => {
        setInput({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            gender: employee.lastName,
            salary: employee.salary,
            departmentId: employee.department.id,
            supervisorId: employee.supervisor?.id
        });
    }, [employee]);

    const onDeleteClick = useCallback(() => {
        
    }, []);

    const onSaveClick = useCallback(() => {
        setInput(undefined);
    }, []);

    const onCancelClick = useCallback(() => {
        setInput(undefined);
    }, []);

    const onFirstNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setInput(old => old !== undefined ? {...old, firstName: e.target.value.trim()} : undefined);
    }, []);

    const onLastNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setInput(old => old !== undefined ? {...old, lastName: e.target.value.trim()} : undefined);
    }, []);

    const onGenderChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setInput(old => old !== undefined ? {...old, gender: e.target.value as Gender} : undefined);
    }, []);

    return (
        <div className={cx(
            css({
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
            }),
            {
                [css({
                    backgroundColor: "lightgrey"       
                })]: input !== undefined
            }
        )}>
            <div>
                <div>
                    <span className={LABEL_CSS}>FirstName: </span>
                    {
                        input !== undefined ? 
                        <input value={input.firstName} onChange={onFirstNameChange}/> :
                        employee.firstName
                    }
                </div>
                <div>
                    <span className={LABEL_CSS}>LastName: </span>
                    {
                        input !== undefined ?
                        <input value={input.lastName} onChange={onLastNameChange}/> :
                        employee.lastName
                    }
                </div>
                <div>
                    <span className={LABEL_CSS}>Gender: </span>
                    {
                        input !== undefined ?
                        <select value={employee.gender} onChange={onGenderChange}>
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                        </select> :
                        employee.gender
                    }
                </div>
                <div className={css({
                    flex: 1,
                    textAlign: "right"   
                })}>
                    {
                        input !== undefined ?
                        <>
                            <button onClick={onSaveClick}>OK</button>
                            <button onClick={onCancelClick}>Cancel</button>
                        </> :
                        <>
                            <button onClick={onEditClick}>Edit</button>
                            <button onClick={onDeleteClick}>Delete</button>
                        </>
                    }
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
                            {employee.firstName} {employee.lastName}
                        </div>
                    }    
                </div>
            </div>
            <div>
                <div>
                    <span className={LABEL_CSS}>Name: </span>    
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
        </div>
    );
})