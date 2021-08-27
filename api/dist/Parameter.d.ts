/**
 * 1. If object is used by field arguments, don't specify the graphqlTypeName
 * 2. If object is used by directive arguments, graphqlTypeName is required
 */
export declare class ParameterRef<TName extends string> {
    readonly name: TName;
    readonly graphqlTypeName?: string | undefined;
    private constructor();
    static of<TName extends string>(name: TName, graphqlTypeName?: string): ParameterRef<TName>;
}
export declare type AcceptableVariables<T extends object> = {
    [K in keyof T]: T[K] | ParameterRef<string>;
};
export declare type UnresolvedVariables<T, TVariables> = ReversedType<UnsrolvedNames<UnresolvedRefs<T>>, TVariables>;
declare type UnresolvedRefs<TVariables> = Pick<TVariables, {
    [K in keyof TVariables]: TVariables[K] extends ParameterRef<string> ? K : never;
}[keyof TVariables]>;
declare type UnsrolvedNames<TUnresolvedVariableRefs> = {
    [K in keyof TUnresolvedVariableRefs]: ParameterRefName<TUnresolvedVariableRefs[K]>;
};
declare type ReversedType<T extends Record<keyof T, keyof any>, TStandard> = {
    [P in T[keyof T]]: {
        [K in keyof T]: T[K] extends P ? (K extends keyof TStandard ? TStandard[K] : never) : never;
    }[keyof T];
};
declare type ParameterRefName<T> = T extends ParameterRef<infer TRefName> ? TRefName : never;
export {};
