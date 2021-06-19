import 'reflect-metadata';
import { Field, FieldResolver, Float, Int, ObjectType, Resolver, Root } from 'type-graphql';
import { employeeTable } from '../dal/EmployeeRepository';
import { Employee } from './Employee';

@ObjectType()
export class Department {

    @Field(() => Int)
    readonly id: number;

    @Field(() => String)
    readonly name: string;

    constructor(args: {
        readonly id: number,
        readonly name: string
    }) {
        this.id = args.id;
        this.name = args.name;
    }
}

/*
 * This simple demo uses data in memory to mock database,
 * so there is no performance issues, "N + 1" query is not a problem 
 * 
 * That means "Resvoler" is enough and "DataLoader" optimization is unnecessary.
 */
@Resolver(Department)
export class DepartmentResolver {

    @FieldResolver(() => [Employee])
    employees(@Root() self: Department): Employee[] {
        return employeeTable
            .findByProp("departmentId", self.id)
            .map(row => new Employee(row));
    }

    @FieldResolver(() => Float)
    avgSalary(@Root() self: Department): number {
        const arr = employeeTable
            .findByProp("departmentId", self.id)
            .map(row => row.salary);
        return arr.length !== 0 ?
            arr.reduce((p, c) => p + c, 0) / arr.length :
            0;
    }
}
