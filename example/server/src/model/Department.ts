/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import 'reflect-metadata';
import { Field, Float, ObjectType } from 'type-graphql';
import { TDepartment } from '../dal/DepartmentRepostiory';
import { employeeTable } from '../dal/EmployeeRepository';
import { Employee } from './Employee';
import { Node } from './Node';

@ObjectType({implements: Node})
export class Department extends Node {

    @Field(() => String)
    readonly name: string;

    constructor(row: TDepartment) {
        super(row.id);
        this.name = row.name;
    }

    @Field(() => [Employee])
    employees(): Employee[] {
        return employeeTable
            .findByProp("departmentId", this.id)
            .map(row => new Employee(row));
    }

    @Field(() => Float)
    avgSalary(): number {
        const arr = employeeTable
            .findByProp("departmentId", this.id)
            .map(row => row.salary);
        return arr.length !== 0 ?
            arr.reduce((p, c) => p + c, 0) / arr.length :
            0;
    }
}

