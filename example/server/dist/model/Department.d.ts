/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
import 'reflect-metadata';
import { TDepartment } from '../dal/DepartmentRepostiory';
import { Employee } from './Employee';
export declare class Department {
    readonly id: number;
    readonly name: string;
    constructor(row: TDepartment);
}
export declare class DepartmentResolver {
    employees(self: Department): Employee[];
    avgSalary(self: Department): number;
}
