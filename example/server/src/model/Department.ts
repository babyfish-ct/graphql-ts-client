/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import 'reflect-metadata';
import { Arg, Field, Float, ObjectType, Root } from 'type-graphql';
import { TDepartment } from '../dal/DepartmentRepostiory';
import { employeeTable } from '../dal/EmployeeRepository';
import { Employee, orderedValueOf } from './Employee';
import { EmployeeOrderedField } from './EmployeeOrderedField';
import { Node } from './Node';
import { OrderMode } from './OrderMode';

@ObjectType({implements: Node})
export class Department extends Node {

    @Field(() => String)
    readonly name: string;

    constructor(row: TDepartment) {
        super(row.id);
        this.name = row.name;
    }

    @Field(() => [Employee])
    employees(
        @Arg("orderBy", () => EmployeeOrderedField, {nullable: true}) orderBy?: EmployeeOrderedField,
        @Arg("orderMode", () => OrderMode, {nullable: true}) orderMode?: OrderMode
    ): Employee[] {
        const employees = employeeTable
            .findByProp("departmentId", this.id)
            .map(row => new Employee(row));
        if (orderBy !== undefined) {
            employees.sort((a, b) => {
                const valueA = orderedValueOf(a, orderBy!);
                const valueB = orderedValueOf(b, orderBy!);
                let result: number;
                if(valueA < valueB) {
                    result = -1;
                } else if (valueA > valueB) {
                    result = +1;
                } else {
                    result = 0;
                }
                return orderMode === OrderMode.DESC ? -result : +result;
            });
        }
        return employees;
    }

    @Field(() => Float)
    avgSalary(@Root() self: Department): number {
        const arr = employeeTable
            .findByProp("departmentId", this.id)
            .map(row => row.salary);
        return arr.length !== 0 ?
            arr.reduce((p, c) => p + c, 0) / arr.length :
            0;
    }
}

