/**
 * @author ChenTao
 *
 * Server-side of example of 'graphql-ts-client'
 */
import 'reflect-metadata';
import { Employee } from '../model/Employee';
import { EmployeeInput } from '../model/EmployeeInput';
export declare class EmployeeService {
    findEmployees(name?: string, departmentId?: string, supervisorId?: string, mockedErrorProbability?: number): Promise<Employee[]>;
    mergeEmployee(input: EmployeeInput): Promise<Employee>;
    deleteEmployee(id: string): Promise<string | undefined>;
}
