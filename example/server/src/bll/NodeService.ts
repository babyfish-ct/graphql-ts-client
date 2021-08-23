import 'reflect-metadata';
import { Arg, ID, Query } from 'type-graphql';
import { departmentTable } from '../dal/DepartmentRepostiory';
import { employeeTable } from '../dal/EmployeeRepository';
import { Department } from '../model/Department';
import { Employee } from '../model/Employee';
import { Node } from '../model/Node';
import { delay } from './Delay';

export class NodeService {

    @Query(() => Node, { nullable: true })
    async node(
        @Arg("id", () => ID) id: String
    ): Promise<Node | undefined> {
        await delay(1000);
        const departmentRow = departmentTable.findById(id);
        if (departmentRow !== undefined) {
            return new Department(departmentRow);
        }
        const employeeRow = employeeTable.findById(id);
        if (employeeRow !== undefined) {
            return new Employee(employeeRow);
        }
        return undefined;
    }
}