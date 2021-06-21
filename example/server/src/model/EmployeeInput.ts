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

    @Field(() => Int)
    readonly id: number;

    @Field(() => String)
    readonly firstName: string;

    @Field(() => String)
    readonly lastName: string;

    @Field(() => String)
    readonly gender: Gender;

    @Field(() => Float)
    readonly salary: number;

    @Field(() => Int)
    readonly departmentId: number;

    @Field(() => Int, {nullable: true})
    readonly supervisorId?: number;
}