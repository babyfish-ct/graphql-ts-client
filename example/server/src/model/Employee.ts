import 'reflect-metadata';
import { Field, FieldResolver, Float, Int, ObjectType, Resolver, Root } from 'type-graphql';
import { departmentTable } from '../dal/DepartmentRepostiory';
import { employeeTable, TEmployee } from '../dal/EmployeeRepository';
import { Department } from './Department';
import { Gender } from './Gender';

@ObjectType()
export class Employee {

    @Field(() => Int)
    readonly id: number;

    @Field(() => String)
    readonly firstName: string;

    @Field(() => String)
    readonly lastName: string;

    @Field(() => Gender)
    readonly gender: Gender;

    @Field(() => Float)
    readonly salary: number;

    readonly departmentId: number;
    
    readonly supervisorId?: number;

    constructor(row: TEmployee) {
        this.id = row.id;
        this.firstName = row.firstName;
        this.lastName = row.lastName;
        this.gender = row.gender;
        this.salary = row.salary;
        this.departmentId = row.departmentId;
        this.supervisorId = row.supervisorId;
    }
}

/*
 * This simple demo uses data in memory to mock database,
 * so there is no performance issues, "N + 1" query is not a problem 
 * 
 * That means "Resvoler" is enough and "DataLoader" optimization is unnecessary.
 */
@Resolver(Employee)
export class EmployeeResolver {

    @FieldResolver(() => Department)
    department(@Root() self: Employee): Department {
        return new Department(departmentTable.findNonNullById(self.departmentId)!);
    }

    @FieldResolver(() => Employee, {nullable: true})
    supervisor(@Root() self: Employee): Employee | undefined {
        if (self.supervisorId === undefined) {
            return undefined;
        }
        return new Employee(employeeTable.findNonNullById(self.supervisorId)!);
    }

    @FieldResolver(() => [Employee])
    subordinates(@Root() self: Employee): Employee[] {
        return employeeTable
            .findByProp("supervisorId", self.id)
            .map(row => new Employee(row));
    }
}