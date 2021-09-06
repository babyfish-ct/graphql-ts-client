/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import 'reflect-metadata';
import { Arg, ID, Int, Mutation, Query } from 'type-graphql';
import { departmentTable, TDepartment } from '../dal/DepartmentRepostiory';
import { Predicate } from '../dal/Table';
import { Department, DepartmentConnection, DepartmentEdge } from '../model/Department';
import { DepartmentInput } from '../model/DepartmentInput';
import { PageInfo } from '../model/PageInfo';
import { createConnection } from './Connections';
import { delay } from './Delay';

export class DepartmentService {

    @Query(() => DepartmentConnection)
    async findDepartmentsLikeName(
        @Arg("name", () => String, {nullable: true}) name?: string | null,
        @Arg("first", () => Int, {nullable: true}) first?: number | null,
        @Arg("after", () => String, {nullable: true}) after?: string | null,
        @Arg("last", () => Int, {nullable: true}) last?: number | null,
        @Arg("before", () => String, {nullable: true}) before?: string | null
    ): Promise<DepartmentConnection> {

        /*
         * Mock the network delay
         */
        await delay(1000);

        const lowercaseName = name?.toLocaleLowerCase();
        const predicate: Predicate<TDepartment> | undefined = 
            lowercaseName !== undefined && lowercaseName !== "" ?
            d => d.name.toLowerCase().indexOf(lowercaseName) !== -1 :
            undefined
        const departments = departmentTable
            .find([], predicate)
            .map(row => new Department(row))
            .sort((a, b) => a.name > b.name ? + 1 : a.name < b.name ? -1 :0);
        return createConnection<DepartmentConnection, DepartmentEdge, Department>({
            totalCount: departments.length,
            getNodes: (offset, count) => departments.slice(offset, offset + count),
            createConnection: (totalCount, edges, pageInfo) => new DepartmentConnection(totalCount, edges, pageInfo),
            createEdge: (node, cursor) => new DepartmentEdge(node, cursor),
            first,
            after,
            last,
            before
        });
    }

    @Mutation(() => Department)
    async mergeDepartment(
        @Arg("input", () => DepartmentInput) input: DepartmentInput
    ): Promise<Department> {
        /*
         * Mock the network delay
         */
        await delay(1000);

        departmentTable.insert(input, true);
        return new Department(input);
    }

    @Mutation(() => ID)
    async deleteDepartment(
        @Arg("id", () => ID) id: string
    ): Promise<string | undefined> {
        
        /*
         * Mock the network delay
         */
        await delay(1000);

        return departmentTable.delete(id) !== 0 ? id : undefined;
    }
}