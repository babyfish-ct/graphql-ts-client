/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
import "reflect-metadata";
import { TDepartment } from "../dal/DepartmentRepostiory";
export declare class DepartmentInput implements TDepartment {
    readonly id: string;
    readonly name: string;
}
