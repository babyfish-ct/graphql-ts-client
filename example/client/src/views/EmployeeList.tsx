/**
 * @author ChenTao
 * 
 * Client-side of example of 'graphql-ts-client' 
 */

import { ChangeEvent, FC, memo, useCallback, useState } from "react";
import { 
    Grid, 
    TextField, 
    Button, 
    Table, 
    TableHead, 
    TableBody, 
    TableRow, 
    TableCell, 
    CircularProgress, 
    InputAdornment,
    makeStyles
} from "@material-ui/core";
import { DepartmentSelector } from "./DepartmentSelector";
import { useRecoilValueLoadable } from "recoil";
import { selectEmployees, useRefresherForSelectEmployees } from "../state/EmployeeSelector";
import { department$, employee$, employee$$ } from "../generated/fetchers";
import { ClientError } from "graphql-request";

export const EmployeeList: FC = memo(() => {

    const [namePattern, setNamePattern] = useState<string>();
    const [departmentId, setDepartmentId] = useState<number>();
    const [mockedErrorProbability, setMockedErrorProbability] = useState(0);

    const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setNamePattern(v === "" ? undefined : v);
    }, []);

    const onProbabilityChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.valueAsNumber;
        setMockedErrorProbability(isNaN(v) ? 0 : v);
    }, []);

    const loadable = useRecoilValueLoadable(
        selectEmployees(
            { namePattern, departmentId, mockedErrorProbability },
            employee$$
            .department(
                department$
                    .name
            )
            .supervisor(
                employee$
                    .firstName
                    .lastName
            )
            .subordinates(
                employee$
                    .firstName
                    .lastName
            )
        )
    );

    const refresh = useRefresherForSelectEmployees();

    const onRefreshClick = useCallback(() => {
        refresh();
    }, [refresh]);

    const classes = useStyles();

    return (
        <div>
            <Grid container spacing={3} className={classes.conditionBar}>
                <Grid item xs={4}>
                    <TextField 
                    value={namePattern}
                    onChange={onNameChange}
                    label="FirstName/lastname" 
                    fullWidth={true}/>
                </Grid>
                <Grid item xs={3}>
                    <DepartmentSelector value={departmentId} onChange={setDepartmentId}/>
                </Grid>
                <Grid item xs={3}>
                    <TextField
                    type="number"
                    value={mockedErrorProbability}
                    onChange={onProbabilityChange}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    label="Mocked error probablity"
                    fullWidth={true}/>
                </Grid>
                <Grid item xs={2}>
                    <Button 
                    onClick={onRefreshClick} 
                    variant="contained" 
                    color="primary">
                        Refresh
                    </Button>
                </Grid>
            </Grid>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Id</TableCell>
                        <TableCell>First Name</TableCell>
                        <TableCell>Last Name</TableCell>
                        <TableCell>Gener</TableCell>
                        <TableCell>Salary</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Supervisor</TableCell>
                        <TableCell>Subordinates</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        loadable.state === 'loading' ?
                        <TableRow>
                            <TableCell colSpan={8}>
                                <CircularProgress/>
                            </TableCell>
                        </TableRow> :
                        undefined
                    }
                    {
                        loadable.state === 'hasError' ?
                        <TableRow>
                            <TableCell colSpan={8}>
                                <div className={classes.error}>
                                    <div className={classes.errorTitle}>Errors raised</div>
                                    <ul>
                                        {
                                            (loadable.errorMaybe() as ClientError)
                                            .response
                                            .errors
                                            ?.map((error, index) => {
                                                return (
                                                    <li key={index}>
                                                        {error.message}
                                                    </li>
                                                );
                                            })
                                        }
                                    </ul>
                                </div>
                            </TableCell>
                        </TableRow> :
                        undefined
                    }
                    {
                        loadable.state === 'hasValue' ?
                        loadable.getValue().map(employee => {
                            return (
                                <TableRow key={employee.id}>
                                    <TableCell>{employee.id}</TableCell>
                                    <TableCell>{employee.firstName}</TableCell>
                                    <TableCell>{employee.lastName}</TableCell>
                                    <TableCell>{employee.gender}</TableCell>
                                    <TableCell>{employee.salary}</TableCell>
                                    <TableCell>{employee.department.name}</TableCell>
                                    <TableCell>
                                        {
                                            employee.supervisor !== undefined ?
                                            `${employee.supervisor?.firstName} ${employee.supervisor?.lastName}` :
                                            undefined
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {
                                            employee
                                                .subordinates
                                                .map(subordinate => `${subordinate.firstName} ${subordinate.lastName}`)
                                                .join(", ")
                                        }
                                    </TableCell>
                                </TableRow>
                            );
                        }) :
                        []
                    }
                </TableBody>
            </Table>
        </div>
    );
});

const useStyles = makeStyles(theme => {
    return {
        conditionBar: {
            alignItems: 'center'
        },
        error: {
            color: theme.palette.error.main
        },
        errorTitle: {
            fontSize: '2rem'
        }
    };
});
