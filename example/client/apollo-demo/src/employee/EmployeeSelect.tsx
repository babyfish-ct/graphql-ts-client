import { ChangeEvent, FC, memo, useCallback } from "react";
import { ERROR_CSS } from "../common/CssClasses";
import { Loading } from "../common/Loading";
import { useTypedQuery } from "../__generated";
import { employee$ } from "../__generated/fetchers";

const EMPLOYEE_OPTION_FETCHER = 
    employee$
    .id
    .firstName
    .lastName;

export const DepartmentSelect: FC<{
    optional?: boolean,
    departmentId?: string,
    value?: string,
    onChange: (value?: string) => void
}> = memo(({optional = false, departmentId, value, onChange}) => {

    const { loading, error, data } = useTypedQuery(
        { queryKey: "findEmployees", dataKey: "options" }, 
        EMPLOYEE_OPTION_FETCHER,
        {
            variables: { departmentId }
        }
    );

    const onSelectChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value;
        onChange(v === '' ? undefined : v);
    }, [onChange]);

    return (
        <>
            { loading && <Loading title="Load options..." mode="INLINE_TINY"/> }
            { error && <div className={ERROR_CSS}>Load options failed</div>}
            {
                !loading && data && 
                <select value={value ?? ''} onChange={onSelectChange}>
                    { optional && <option value="">--Unspeified--</option>}
                    {
                        data.options.map(option => 
                            <option key={option.id} value={option.id}>{option.firstName} {option.lastName}</option>
                        )
                    }
                </select>
            }
        </>
    );
});