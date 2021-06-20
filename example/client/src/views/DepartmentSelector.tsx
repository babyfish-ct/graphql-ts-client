import { FC, memo } from "react";
import { Select, MenuItem } from "@material-ui/core";
import { useRecoilValueLoadable } from "recoil";
import { selectDepartmentsLikeName } from "../state/Department";
import { department$$ } from "../generated/fetchers";

export const DepartmentSelector: FC = memo(() => {

    const loadable = useRecoilValueLoadable(
        selectDepartmentsLikeName(
            undefined,
            department$$
        )
    );
    return (
        <Select disabled={loadable.state !== 'hasValue'}>
            {
                [
                    <MenuItem key="None" value={0}>--Any--</MenuItem>,
                    ...(
                        loadable.state === 'hasValue' ?
                        loadable.getValue().map(department => {
                            return (
                                <MenuItem key={department.id} value={department.id}>
                                    {department.name}
                                </MenuItem>
                            ); 
                        }) :
                        []
                    )
                ]
            }
        </Select>
    );
});