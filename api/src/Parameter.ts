export class ParameterRef<T> {

    constructor(readonly name: string) {
        if (!name.startsWith("$")) {
            throw new Error("parameter name must start with '$'");
        }
    }
}

export type ArgumentsType<T> =
    T extends object ? { [K in keyof T]: ArgumentsType<T[K]> } :
    T |
    ParameterRef<T>;
    
