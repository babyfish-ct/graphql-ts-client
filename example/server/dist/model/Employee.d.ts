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
    department(): Department;
    supervisor(): Employee | undefined;
    subordinates(): Employee[];
    constructor(row: TEmployee);
}
