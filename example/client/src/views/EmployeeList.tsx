import { FC, memo } from "react";
import { Grid, TextField } from "@material-ui/core";
import { DepartmentSelector } from './DepartmentSelector';

export const EmployeeList: FC = memo(() => {
    return (
        <Grid container>
            <Grid item xs={12}>
                <Grid item xs={4}>
                    <TextField label="FirstName or lastname"/>
                </Grid>
                <Grid item xs={4}>
                    <DepartmentSelector/>
                </Grid>
            </Grid>
        </Grid>
    );
});