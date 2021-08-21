/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
import "reflect-metadata";
import { TEmployee } from "../dal/EmployeeRepository";
import { Gender } from "./Gender";
export declare class EmployeeInput implements TEmployee {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly gender: Gender;
    readonly salary: number;
    readonly departmentId: string;
    readonly supervisorId?: string;
}
