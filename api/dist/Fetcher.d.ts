export interface Fetcher<T> {
    __supressWarnings__(value: T): never;
}
export declare type ModelType<F> = F extends Fetcher<infer M> ? M : never;
export declare abstract class AbstractFetcher<T> implements Fetcher<T> {
    private prev;
    private negative;
    private field;
    private args?;
    private child?;
    private str?;
    constructor(prev: AbstractFetcher<unknown> | undefined, negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<unknown>);
    protected addField<F extends AbstractFetcher<unknown>>(field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<unknown>): F;
    protected removeField<F extends AbstractFetcher<unknown>>(field: string): F;
    protected abstract createFetcher(prev: AbstractFetcher<unknown> | undefined, negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<unknown>): AbstractFetcher<unknown>;
    toString(): string;
    private toString0;
    private static appendIndentTo;
    private static appendFieldTo;
    __supressWarnings__(value: T): never;
}
