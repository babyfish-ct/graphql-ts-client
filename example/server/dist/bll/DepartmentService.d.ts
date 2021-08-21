/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
import 'reflect-metadata';
import { Department } from '../model/Department';
import { DepartmentInput } from '../model/DepartmentInput';
export declare class DepartmentService {
    findDepartmentsLikeName(name?: string): Promise<Department[]>;
    mergeDepartment(input: DepartmentInput): Promise<Department>;
    deleteDepartment(id: string): Promise<string | undefined>;
}
