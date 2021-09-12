/**
 * 1. If object is used by field arguments, don't specify the graphqlTypeName
 * 2. If object is used by directive arguments, graphqlTypeName is required
 */
export class ParameterRef<TName extends string> {

    readonly " $__instanceOfParameterRef" = true;

    private constructor(readonly name: TName, readonly graphqlTypeName?: string) {
        if (name.startsWith("$")) {
            throw new Error("parameter name cannot start with '$'");
        }
    }

    static of<TName extends string>(name: TName, graphqlTypeName?: string): ParameterRef<TName> {
        return new ParameterRef<TName>(name, graphqlTypeName);
    }
}

export type AcceptableVariables<T extends object> = { 
    [K in keyof T]: T[K] | ParameterRef<string> 
};

export type UnresolvedVariables<T, TVariables> = 
    ReversedType<UnsrolvedNames<UnresolvedRefs<T>>, TVariables>;

type UnresolvedRefs<TVariables> = Pick<
    TVariables,
    { 
        [K in keyof TVariables]: TVariables[K] extends ParameterRef<string> ? K : never
    }[keyof TVariables]
>;

type UnsrolvedNames<TUnresolvedVariableRefs> = { 
    [K in keyof TUnresolvedVariableRefs]: ParameterRefName<TUnresolvedVariableRefs[K]> 
};

type ReversedType<T extends Record<keyof T, keyof any>, TStandard> = {
    [P in T[keyof T]]: {
        [K in keyof T]: T[K] extends P ? (K extends keyof TStandard ? TStandard[K] : never) : never
    }[keyof T]
}

type ParameterRefName<T> = 
    T extends ParameterRef<infer TRefName> 
    ? TRefName :
    never
; 
