/**
 * @author ChenTao
 * 
 * Server-side of example of 'graphql-ts-client'
 */

 import 'reflect-metadata';
import { Field, ObjectType } from 'type-graphql';

 @ObjectType()
 export class PageInfo {

    constructor(
        hasNextPage: boolean,
        hasPreviousPage: boolean,
        startCursor: string,
        endCursor: string
    ) {
        this.hasNextPage = hasNextPage;
        this.hasPreviousPage = hasPreviousPage;
        this.startCursor = startCursor;
        this.endCursor = endCursor;
    }

    @Field(() => Boolean)
    readonly hasNextPage: boolean;

    @Field(() => Boolean)
    readonly hasPreviousPage: boolean;

    @Field(() => String)
    readonly startCursor: string;

    @Field(() => String)
    readonly endCursor: string;
}