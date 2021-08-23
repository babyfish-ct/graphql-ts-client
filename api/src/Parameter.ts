export class ParameterRef<TName extends string> {

    private constructor(readonly name: TName) {
        if (name.startsWith("$")) {
            throw new Error("parameter name cannot start with '$'");
        }
    }

    static of<TName extends string>(name: TName): ParameterRef<TName> {
        return new ParameterRef<TName>(name);
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
