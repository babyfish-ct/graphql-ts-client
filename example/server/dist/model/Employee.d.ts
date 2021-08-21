/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
import 'reflect-metadata';
import { TEmployee } from '../dal/EmployeeRepository';
import { Department } from './Department';
import { Gender } from './Gender';
import { Node } from './Node';
export declare class Employee extends Node {
    readonly firstName: string;
    readonly lastName: string;
    readonly gender: Gender;
    readonly salary: number;
    readonly departmentId: string;
    readonly supervisorId?: string;
    constructor(row: TEmployee);
}
export declare class EmployeeResolver {
    department(self: Employee): Department;
    supervisor(self: Employee): Employee | undefined;
    subordinates(self: Employee): Employee[];
}
