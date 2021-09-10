export type BusinessArgs<TArgs> =
    Omit<TArgs, "first" | "after" | "last" | "before">;