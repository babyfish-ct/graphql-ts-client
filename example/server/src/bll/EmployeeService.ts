import 'reflect-metadata';
import { Arg, Int, Mutation, Query } from 'type-graphql';
import { departmentTable } from '../dal/DepartmentRepostiory';
import { employeeTable, TEmployee } from '../dal/EmployeeRepository';
import { Predicate } from '../dal/Table';
import { Employee } from '../model/Employee';
import { EmployeeInput } from '../model/EmployeeInput';
import { delay } from './Delay';

export class EmployeeService {

    @Query(() => [Employee])
    async findEmployees(
        @Arg("departmentId", () => Int, {nullable: true}) departmentId?: number,
        @Arg("supervisorId", () => Int, {nullable: true}) supervisorId?: number,
        @Arg("namePattern", () => String, {nullable: true}) namePattern?: string
    ): Promise<Employee[]> {

        /*
         * Mock the network delay
         */
        await delay(1000);
        
        const lowercaseName = namePattern?.toLocaleLowerCase();
        return employeeTable
            .find(
                [
                    departmentId !== undefined ? 
                    { prop: "departmentId", value: departmentId } :
                    undefined,
                    supervisorId !== undefined ? 
                    { prop: "supervisorId", value: supervisorId } :
                    undefined,
                ], 
                lowercaseName !== undefined && lowercaseName !== "" ?
                d => (
                    d.firstName.toLowerCase().indexOf(lowercaseName) !== -1 ||
                    d.lastName.toLowerCase().indexOf(lowercaseName) !== -1
                ) :
                undefined
            )
            .map(row => new Employee(row));
    }

    @Mutation(() => Int)
    mergeEmployee(
        @Arg("input", () => EmployeeInput) input: EmployeeInput
    ): number {
        employeeTable.insert(input, true);
        return 1;
    }

    @Mutation(() => Int)
    deleteEmployee(
        @Arg("id", () => Int) id: number
    ): number {
        return employeeTable.delete(id);
    }
}