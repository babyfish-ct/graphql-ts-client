import 'reflect-metadata';
import { Field, ID, InterfaceType } from "type-graphql";

@InterfaceType({ autoRegisterImplementations: false })
export abstract class Node {

    @Field(() => ID)
    readonly id: string

    constructor(id: string) {
        this.id = id;
    }
}