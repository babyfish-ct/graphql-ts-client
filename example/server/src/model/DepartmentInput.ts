/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import "reflect-metadata";
import { Field, InputType, Int } from "type-graphql";
import { TDepartment } from "../dal/DepartmentRepostiory";

@InputType()
export class DepartmentInput implements TDepartment {

    @Field(() => Int)
    readonly id: number;

    @Field(() => String)
    readonly name: string;
}