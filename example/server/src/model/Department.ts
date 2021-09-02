/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import 'reflect-metadata';
import { Arg, Field, Float, Int, ObjectType } from 'type-graphql';
import { createConnection } from '../bll/Connections';
import { TDepartment } from '../dal/DepartmentRepostiory';
import { employeeTable } from '../dal/EmployeeRepository';
import { Employee, EmployeeConnection, EmployeeEdge } from './Employee';
import { Node } from './Node';
import { PageInfo } from './PageInfo';

@ObjectType({implements: Node})
export class Department extends Node {

    @Field(() => String)
    readonly name: string;

    constructor(row: TDepartment) {
        super(row.id);
        this.name = row.name;
    }

    @Field(() => EmployeeConnection)
    employees(
        @Arg("first", () => Int, {nullable: true}) first?: number,
        @Arg("after", () => String, {nullable: true}) after?: string,
        @Arg("last", () => Int, {nullable: true}) last?: number,
        @Arg("before", () => String, {nullable: true}) before?: string
    ): EmployeeConnection {
        const employees = employeeTable
            .findByProp("departmentId", this.id)
            .map(row => new Employee(row));
        return createConnection<EmployeeConnection, EmployeeEdge, Employee>({
            totalCount: employees.length,
            getNodes: (offset, count) => employees.slice(offset, offset + count),
            createEdge: (node, cursor) => new EmployeeEdge(node, cursor),
            createConnection: (totalCount, edges, pageInfo) => new EmployeeConnection(totalCount, edges, pageInfo),
            first,
            after,
            last,
            before
        });
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

@ObjectType()
export class DepartmentConnection {

    constructor(totalCount: number, edges: readonly DepartmentEdge[], pageInfo: PageInfo) {
        this.totalCount = totalCount;
        this.edges = edges;
        this.pageInfo = pageInfo;
    }

    @Field(() => Int)
    readonly totalCount: number;

    @Field(() => [DepartmentEdge])
    readonly edges: readonly DepartmentEdge[];

    @Field(() => PageInfo)
    readonly pageInfo: PageInfo;
}

@ObjectType()
export class DepartmentEdge {

    constructor(node: Department, cursor: string) {
        this.node = node;
        this.cursor = cursor;
    }

    @Field(() => Department)
    readonly node: Department;

    @Field(() => String)
    readonly cursor: string;
}

