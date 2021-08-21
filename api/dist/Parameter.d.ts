export declare class ParameterRef<T> {
    readonly name: string;
    constructor(name: string);
}
export declare type ArgumentsType<T> = T extends object ? {
    [K in keyof T]: ArgumentsType<T[K]>;
} : T | ParameterRef<T>;
