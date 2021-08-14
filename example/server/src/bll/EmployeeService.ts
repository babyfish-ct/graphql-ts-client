/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import 'reflect-metadata';
import { Arg, Int, Mutation, Query } from 'type-graphql';
import { employeeTable } from '../dal/EmployeeRepository';
import { Employee } from '../model/Employee';
import { EmployeeInput } from '../model/EmployeeInput';
import { delay } from './Delay';

export class EmployeeService {

    @Query(() => [Employee])
    async findEmployees(
        @Arg("namePattern", () => String, {nullable: true}) namePattern?: string,
        @Arg("departmentId", () => Int, {nullable: true}) departmentId?: number,
        @Arg("supervisorId", () => String, {nullable: true}) supervisorId?: string,
        @Arg("mockedErrorProbability", () => Int, {nullable: true}) mockedErrorProbability?: number
    ): Promise<Employee[]> {

        /*
         * Mock the network delay
         */
        await delay(1000);

        /*
         * Mock the network error
         */
        if (mockedErrorProbability !== undefined && mockedErrorProbability > 0) {
            const top = Math.min(mockedErrorProbability, 100);
            if (Math.floor(Math.random() * 100) < top) {
                throw new Error(`Mocked error by nodejs at '${Date()}'`);
            }
        }
        
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

    @Mutation(() => Employee)
    async mergeEmployee(
        @Arg("input", () => EmployeeInput) input: EmployeeInput
    ): Promise<Employee> {
        
        /*
         * Mock the network delay
         */
        await delay(1000);

        employeeTable.insert(input, true);
        return new Employee(input);
    }

    @Mutation(() => Boolean)
    async deleteEmployee(
        @Arg("id", () => Int) id: number
    ): Promise<boolean> {

        /*
         * Mock the network delay
         */
        return employeeTable.delete(id) !== 0;
    }
}