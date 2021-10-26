import { FragmentRefs } from 'relay-runtime';
import { TypedFragment } from 'graphql-ts-client-relay';
import type { FieldOptions, DirectiveArgs } from 'graphql-ts-client-api';
import { ObjectFetcher, createFetcher, createFetchableType } from 'graphql-ts-client-api';
import type { WithTypeName, ImplementationType } from '../CommonTypes';
import { node$ } from './NodeFetcher';
import {Gender} from '../enums';

/*
 * Any instance of this interface is immutable,
 * all the properties and functions can only be used to create new instances,
 * they cannot modify the current instance.
 * 
 * So any instance of this interface is reuseable.
 */
export interface EmployeeFetcher<T extends object, TVariables extends object> extends ObjectFetcher<'Employee', T, TVariables> {

    on<XName extends ImplementationType<'Employee'>, X extends object, XVariables extends object>(
        child: ObjectFetcher<XName, X, XVariables>, 
        fragmentName?: string // undefined: inline fragment; otherwise, otherwise, real fragment
    ): EmployeeFetcher<
        XName extends 'Employee' ?
        T & X :
        WithTypeName<T, ImplementationType<'Employee'>> & (
            WithTypeName<X, ImplementationType<XName>> | 
            {__typename: Exclude<ImplementationType<'Employee'>, ImplementationType<XName>>}
        ), 
        TVariables & XVariables
    >;

    on<XFragmentName extends string, XData extends object, XVariables extends object>(
        child: TypedFragment<XFragmentName, "Employee", XData, XVariables>
    ): EmployeeFetcher<
        T & {
            readonly " $data": XData, 
            readonly " $fragmentRefs": FragmentRefs<XFragmentName>
        }, 
        TVariables & XVariables
    >;


    directive(name: string, args?: DirectiveArgs): EmployeeFetcher<T, TVariables>;


    readonly __typename: EmployeeFetcher<T & {__typename: ImplementationType<'Employee'>}, TVariables>;


    readonly id: EmployeeFetcher<T & {readonly "id": string}, TVariables>;

    "id+"<
        XAlias extends string = "id", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        optionsConfigurer?: (
            options: FieldOptions<"id", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): EmployeeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: string} : 
                {readonly [key in XAlias]: string}
        ), 
        TVariables & XDirectiveVariables
    >;

    readonly "~id": EmployeeFetcher<Omit<T, 'id'>, TVariables>;


    readonly firstName: EmployeeFetcher<T & {readonly "firstName": string}, TVariables>;

    "firstName+"<
        XAlias extends string = "firstName", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        optionsConfigurer?: (
            options: FieldOptions<"firstName", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): EmployeeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: string} : 
                {readonly [key in XAlias]: string}
        ), 
        TVariables & XDirectiveVariables
    >;

    readonly "~firstName": EmployeeFetcher<Omit<T, 'firstName'>, TVariables>;


    readonly lastName: EmployeeFetcher<T & {readonly "lastName": string}, TVariables>;

    "lastName+"<
        XAlias extends string = "lastName", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        optionsConfigurer?: (
            options: FieldOptions<"lastName", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): EmployeeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: string} : 
                {readonly [key in XAlias]: string}
        ), 
        TVariables & XDirectiveVariables
    >;

    readonly "~lastName": EmployeeFetcher<Omit<T, 'lastName'>, TVariables>;


    readonly gender: EmployeeFetcher<T & {readonly "gender": Gender}, TVariables>;

    "gender+"<
        XAlias extends string = "gender", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        optionsConfigurer?: (
            options: FieldOptions<"gender", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): EmployeeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: Gender} : 
                {readonly [key in XAlias]: Gender}
        ), 
        TVariables & XDirectiveVariables
    >;

    readonly "~gender": EmployeeFetcher<Omit<T, 'gender'>, TVariables>;


    readonly salary: EmployeeFetcher<T & {readonly "salary": number}, TVariables>;

    "salary+"<
        XAlias extends string = "salary", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        optionsConfigurer?: (
            options: FieldOptions<"salary", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): EmployeeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: number} : 
                {readonly [key in XAlias]: number}
        ), 
        TVariables & XDirectiveVariables
    >;

    readonly "~salary": EmployeeFetcher<Omit<T, 'salary'>, TVariables>;


    department<
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "department", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        child: ObjectFetcher<'Department', X, XVariables>, 
        optionsConfigurer?: (
            options: FieldOptions<"department", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): EmployeeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: X} : 
                {readonly [key in XAlias]: X}
        ), 
        TVariables & XVariables & XDirectiveVariables
    >;


    supervisor<
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "supervisor", 
        XDirectiveVariables extends object = {}
    >(
        child: ObjectFetcher<'Employee', X, XVariables>, 
        optionsConfigurer?: (
            options: FieldOptions<"supervisor", {}, {}>
        ) => FieldOptions<XAlias, {readonly [key: string]: DirectiveArgs}, XDirectiveVariables>
    ): EmployeeFetcher<
        T & {readonly [key in XAlias]?: X}, 
        TVariables & XVariables & XDirectiveVariables
    >;


    subordinates<
        X extends object, 
        XVariables extends object, 
        XAlias extends string = "subordinates", 
        XDirectives extends { readonly [key: string]: DirectiveArgs } = {}, 
        XDirectiveVariables extends object = {}
    >(
        child: ObjectFetcher<'Employee', X, XVariables>, 
        optionsConfigurer?: (
            options: FieldOptions<"subordinates", {}, {}>
        ) => FieldOptions<XAlias, XDirectives, XDirectiveVariables>
    ): EmployeeFetcher<
        T & (
            XDirectives extends { readonly include: any } | { readonly skip: any } ? 
                {readonly [key in XAlias]?: readonly X[]} : 
                {readonly [key in XAlias]: readonly X[]}
        ), 
        TVariables & XVariables & XDirectiveVariables
    >;
}

export const employee$: EmployeeFetcher<{}, {}> = 
    createFetcher(
        createFetchableType(
            "Employee", 
            "OBJECT", 
            [node$.fetchableType], 
            [
                "firstName", 
                "lastName", 
                "gender", 
                "salary", 
                {
                    category: "REFERENCE", 
                    name: "department", 
                    targetTypeName: "Department"
                }, 
                {
                    category: "REFERENCE", 
                    name: "supervisor", 
                    targetTypeName: "Employee", 
                    undefinable: true
                }, 
                {
                    category: "LIST", 
                    name: "subordinates", 
                    targetTypeName: "Employee"
                }
            ]
        ), 
        undefined
    )
;

export const employee$$ = 
    employee$
        .id
        .firstName
        .lastName
        .gender
        .salary
;
