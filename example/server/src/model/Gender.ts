/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

import "reflect-metadata";
import { registerEnumType } from "type-graphql";

export enum Gender {
    MALE,
    FEMALE
}

registerEnumType(Gender, {name: "Gender"});