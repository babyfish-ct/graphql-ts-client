/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import 'reflect-metadata';
import { Arg, ID, Mutation, Query } from 'type-graphql';
import { departmentTable, TDepartment } from '../dal/DepartmentRepostiory';
import { Predicate } from '../dal/Table';
import { Department } from '../model/Department';
import { DepartmentInput } from '../model/DepartmentInput';
import { delay } from './Delay';

export class DepartmentService {

    @Query(() => [Department])
    async findDepartmentsLikeName(
        @Arg("name", () => String, {nullable: true}) name?: string | null
    ): Promise<Department[]> {

        /*
         * Mock the network delay
         */
        await delay(1000);

        const lowercaseName = name?.toLocaleLowerCase();
        const predicate: Predicate<TDepartment> | undefined = 
            lowercaseName !== undefined && lowercaseName !== "" ?
            d => d.name.toLowerCase().indexOf(lowercaseName) !== -1 :
            undefined
        return departmentTable
            .find([], predicate)
            .map(row => new Department(row))
            .sort((a, b) => a.name > b.name ? + 1 : a.name < b.name ? -1 :0);
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