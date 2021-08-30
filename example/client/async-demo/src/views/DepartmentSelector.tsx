/**
 * @author ChenTao
 * 
 * Client-side of example of 'graphql-ts-client' 
 */

import { ChangeEvent, FC, memo, useCallback } from "react";
import { Select, MenuItem, FormControl, InputLabel, CircularProgress } from "@material-ui/core";
import { department$$, query$ } from "../__generated/fetchers";
import { execute } from "../__generated/Async";
import { useState } from "react";
import { useEffect } from "react";
import { ModelType } from "graphql-ts-client-api";

const DEPARTMENT_LIST_FETCHER = 
    query$
    .findDepartmentsLikeName(
        department$$,
        options => options.alias("departments")
    );

export const DepartmentSelector: FC<{
    value?: string,
    onChange: (value?: string) => void
}> = memo(({value, onChange}) => {

    const [data, setData] = useState<ModelType<typeof DEPARTMENT_LIST_FETCHER>>();
    const [error, setError] = useState<Error>();
    const [loading, setLoading] = useState(false);

    const findDepartments = useCallback(async () => {
        setLoading(true);
        setData(undefined);
        setError(undefined);
        try {
            const data = await execute(DEPARTMENT_LIST_FETCHER);
            setData(data);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        findDepartments();
    }, [findDepartments]);

    const onSelectChange = useCallback((e: ChangeEvent<{value: any}>) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : v);
    }, [onChange]);

    return (
        <FormControl fullWidth={true}>
            <InputLabel>
                Department
                { loading && <CircularProgress size="1rem"/> }
                { error && <span style={{color:"red"}}>Load failed...</span>}
            </InputLabel>
            <Select 
            disabled={data === undefined} 
            error={false}
            value={value ?? ""}
            onChange={onSelectChange}
            fullWidth={true}>
                <MenuItem key="Nonde" value="">
                    <em>Unspecified</em>
                </MenuItem>
                {
                    data?.departments?.map(department =>
                        <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>
                    )
                }
            </Select>
        </FormControl>
    );
});
