import { ChangeEvent, FC, memo, useCallback, useEffect } from "react";
import { ERROR_CSS } from "../common/CssClasses";
import { Loading } from "../common/Loading";
import { useTypedQuery } from "../__generated";
import { department$ } from "../__generated/fetchers";

const DEPARTMENT_OTPITON_FETCHER = 
    department$
    .id
    .name

export const DepartmentSelect: FC<{
    optional?: boolean,
    value?: string,
    onChange: (value?: string) => void
}> = memo(({optional = false, value, onChange}) => {

    const { loading, error, data } = useTypedQuery(
        { queryKey: "findDepartmentsLikeName", dataKey: "options" }, 
        DEPARTMENT_OTPITON_FETCHER
    );

    const onSelectChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value;
        onChange(v === '' ? undefined : v);
    }, [onChange]);

    useEffect(() => {
        if (!optional && value === undefined && data !== undefined && data.options.length > 0) {
            onChange(data.options[0].id);
        }
    }, [optional, value, data, onChange]);

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
                            <option key={option.id} value={option.id}>{option.name}</option>
                        )
                    }
                </select>
            }
        </>
    );
});