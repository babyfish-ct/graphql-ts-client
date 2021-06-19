import 'reflect-metadata';
import { Field, FieldResolver, Float, Int, ObjectType, Resolver, Root } from 'type-graphql';
import { departmentTable } from '../dal/DepartmentRepostiory';
import { employeeTable } from '../dal/EmployeeRepository';
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

    constructor(args: {
        readonly id: number,
        readonly firstName: string,
        readonly lastName: string,
        readonly gender: Gender,
        readonly salary: number,
        readonly departmentId: number,
        readonly supervisorId?: number
    }) {
        this.id = args.id;
        this.firstName = args.firstName;
        this.lastName = args.lastName;
        this.gender = args.gender;
        this.salary = args.salary;
        this.departmentId = args.departmentId;
        this.supervisorId = args.supervisorId;
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
        const row = departmentTable.findById(self.departmentId);
        if (row === undefined) {
            throw new Error("Illegal data that broken foreign key constriant");
        }
        return new Department(row);
    }

    @FieldResolver(() => Employee, {nullable: true})
    supervisor(@Root() self: Employee): Employee | undefined {
        if (self.supervisorId === undefined) {
            return undefined;
        }
        const row = employeeTable.findById(self.supervisorId);
        if (row === undefined) {
            throw new Error("Illegal data that broken foreign key constriant");
        }
        return new Employee(row);
    }

    @FieldResolver(() => [Employee])
    subordinates(@Root() self: Employee): Employee[] {
        return employeeTable
            .findByProp("supervisorId", self.id)
            .map(row => new Employee(row));
    }
}