/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
import 'reflect-metadata';
import { TDepartment } from '../dal/DepartmentRepostiory';
import { Employee } from './Employee';
import { Node } from './Node';
export declare class Department extends Node {
    readonly name: string;
    constructor(row: TDepartment);
}
export declare class DepartmentResolver {
    employees(self: Department): Employee[];
    avgSalary(self: Department): number;
}
