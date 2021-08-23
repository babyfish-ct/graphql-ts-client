/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import "reflect-metadata";
import { Field, Float, InputType, Int } from "type-graphql";
import { TEmployee } from "../dal/EmployeeRepository";
import { Gender } from "./Gender";

@InputType()
export class EmployeeInput implements TEmployee {

    @Field(() => String)
    readonly id: string;

    @Field(() => String)
    readonly firstName: string;

    @Field(() => String)
    readonly lastName: string;

    @Field(() => Gender)
    readonly gender: Gender;

    @Field(() => Float)
    readonly salary: number;

    @Field(() => String)
    readonly departmentId: string;

    @Field(() => String, {nullable: true})
    readonly supervisorId?: string;
}