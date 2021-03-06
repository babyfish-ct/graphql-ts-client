import { ChangeEvent, FC, memo, useCallback, useEffect } from "react";
import { ERROR_CSS } from "../common/CssClasses";
import { Loading } from "../common/Loading";
import { useTypedQuery } from "../__generated";
import { department$, departmentConnection$, departmentEdge$, query$ } from "../__generated/fetchers";

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
        query$.findDepartmentsLikeName( 
            departmentConnection$.edges(
                departmentEdge$.node(
                    DEPARTMENT_OTPITON_FETCHER
                )
            ),
            options => options.alias("optionConnection")
        )
    );

    const onSelectChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value;
        onChange(v === '' ? undefined : v);
    }, [onChange]);

    useEffect(() => {
        if (!optional && value === undefined && data !== undefined && data.optionConnection.edges.length > 0) {
            onChange(data.optionConnection.edges[0].node.id);
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
                        data.optionConnection.edges.map(edge => 
                            <option key={edge.node.id} value={edge.node.id}>{edge.node.name}</option>
                        )
                    }
                </select>
            }
        </>
    );
});