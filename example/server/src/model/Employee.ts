/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import 'reflect-metadata';
import { Field, Float, ObjectType } from 'type-graphql';
import { departmentTable } from '../dal/DepartmentRepostiory';
import { employeeTable, TEmployee } from '../dal/EmployeeRepository';
import { Department } from './Department';
import { Gender } from './Gender';
import { Node } from './Node';

@ObjectType({implements: Node})
export class Employee extends Node {

    @Field(() => String)
    readonly firstName: string;

    @Field(() => String)
    readonly lastName: string;

    @Field(() => Gender)
    readonly gender: Gender;

    @Field(() => Float)
    readonly salary: number;

    readonly departmentId: string;
    
    readonly supervisorId?: string;

    @Field(() => Department)
    department(): Department {
        return new Department(departmentTable.findNonNullById(this.departmentId)!);
    }

    @Field(() => Employee, {nullable: true})
    supervisor(): Employee | undefined {
        if (this.supervisorId === undefined) {
            return undefined;
        }
        return new Employee(employeeTable.findNonNullById(this.supervisorId)!);
    }

    @Field(() => [Employee])
    subordinates(): Employee[] {
        return employeeTable
            .findByProp("supervisorId", this.id)
            .map(row => new Employee(row));
    }

    constructor(row: TEmployee) {
        super(row.id);
        this.firstName = row.firstName;
        this.lastName = row.lastName;
        this.gender = row.gender;
        this.salary = row.salary;
        this.departmentId = row.departmentId;
        this.supervisorId = row.supervisorId;
    }
}
