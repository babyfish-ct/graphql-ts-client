import type { FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';
import { ENUM_INPUT_METADATA } from '../EnumInputMetadata';
import type { ObjectFetcher } from 'graphql-ts-client-api';
import { createFetcher, createFetchableType } from 'graphql-ts-client-api';
import type { WithTypeName, ImplementationType } from '../CommonTypes';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface NodeFetcher<T extends object, TVariables extends object> extends ObjectFetcher<'Node', T, TVariables> {

    on<XName extends ImplementationType<'Node'>, X extends object, XVariables extends object>(
        child: ObjectFetcher<XName, X, XVariables>, 
        fragmentName?: string // undefined: inline fragment; otherwise, otherwise, real fragment
    ): NodeFetcher<
        XName extends 'Node' ?
        T & X :
        WithTypeName<T, ImplementationType<'Node'>> & (
            WithTypeName<X, ImplementationType<XName>> | 
            {__typename: Exclude<ImplementationType<'Node'>, ImplementationType<XName>>}
        ), 
        TVariables & XVariables
    >;


    directive(name: string, args?: DirectiveArgs): NodeFetcher<T, TVariables>;


    readonly __typename: NodeFetcher<T & {__typename: ImplementationType<'Node'>}, TVariables>;


    readonly id: NodeFetcher<T & {readonly "id": string}, TVariables>;

    "id+"<
        XAlias extends string = "id", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        optionsConfigurer: (
            options: FieldOptions<"id", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): NodeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: string} : 
                {readonly [key in XAlias]: string}
        ), 
        TVariables & XDirectiveVariables
    >;

    readonly "~id": NodeFetcher<Omit<T, 'id'>, TVariables>;
}

export const node$: NodeFetcher<{}, {}> = 
    createFetcher(
        createFetchableType(
            "Node", 
            "OBJECT", 
            [], 
            [
                {
                    category: "ID", 
                    name: "id"
                }
            ]
        ), 
        ENUM_INPUT_METADATA, 
        undefined
    )
;

export const node$$ = 
    node$
        .id
;
