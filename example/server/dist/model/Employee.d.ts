/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
import 'reflect-metadata';
import { TEmployee } from '../dal/EmployeeRepository';
import { Department } from './Department';
import { Gender } from './Gender';
export declare class Employee {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly gender: Gender;
    readonly salary: number;
    readonly departmentId: number;
    readonly supervisorId?: string;
    constructor(row: TEmployee);
}
export declare class EmployeeResolver {
    department(self: Employee): Department;
    supervisor(self: Employee): Employee | undefined;
    subordinates(self: Employee): Employee[];
}
