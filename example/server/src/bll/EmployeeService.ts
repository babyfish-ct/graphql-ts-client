/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import 'reflect-metadata';
import { Arg, ID, Int, Mutation, Query } from 'type-graphql';
import { employeeTable } from '../dal/EmployeeRepository';
import { Employee, EmployeeConnection, EmployeeEdge } from '../model/Employee';
import { EmployeeInput } from '../model/EmployeeInput';
import { createConnection } from './Connections';
import { delay } from './Delay';

export class EmployeeService {

    @Query(() => EmployeeConnection)
    async findEmployees(
        @Arg("name", () => String, {nullable: true}) name?: string,
        @Arg("departmentId", () => String, {nullable: true}) departmentId?: string,
        @Arg("supervisorId", () => String, {nullable: true}) supervisorId?: string,
        @Arg("mockedErrorProbability", () => Int, {nullable: true}) mockedErrorProbability?: number,
        @Arg("first", () => Int, {nullable: true}) first?: number,
        @Arg("after", () => String, {nullable: true}) after?: string,
        @Arg("last", () => Int, {nullable: true}) last?: number,
        @Arg("before", () => String, {nullable: true}) before?: string
    ): Promise<EmployeeConnection> {

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
        
        const lowercaseName = name?.toLocaleLowerCase();
        const employees = employeeTable
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
            .map(row => new Employee(row))
            .sort((a, b) => a.firstName > b.firstName ? + 1 : a.firstName < b.firstName ? -1 :0);
        return createConnection<EmployeeConnection, EmployeeEdge, Employee>({
            totalCount: employees.length,
            getNodes: (offset, count) => employees.slice(offset, offset + count),
            createEdge: (node, cursor) => new EmployeeEdge(node, cursor),
            createConnection: (totalCount, edges, pageInfo) => new EmployeeConnection(totalCount, edges, pageInfo),
            first,
            after,
            last,
            before
        });
    }

    @Mutation(() => Employee)
    async mergeEmployee(
        @Arg("input", () => EmployeeInput) input: EmployeeInput
    ): Promise<Employee> {
        
        /*
         * Mock the network delay
         */
        await delay(1000);

        for (let suprvisorId = input.supervisorId; 
            suprvisorId !== undefined;
            suprvisorId = employeeTable.findByUniqueProp("id", suprvisorId)?.supervisorId
        ) {
            if (suprvisorId === input.id) {
                throw new Error("Cannot modify the supervisor, it would make the data reference cycle problem if it is allowed");
            }
        }
        employeeTable.insert(input, true);
        return new Employee(input);
    }

    @Mutation(() => ID)
    async deleteEmployee(
        @Arg("id", () => ID) id: string
    ): Promise<string | undefined> {

        /*
         * Mock the network delay
         */
        await delay(1000);

        return employeeTable.delete(id) !== 0 ? id : undefined;
    }
}