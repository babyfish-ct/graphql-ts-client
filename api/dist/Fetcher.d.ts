export interface Fetcher<T extends object> {
    __supressWarnings__(value: T): never;
}
export declare type ModelType<F> = F extends Fetcher<infer M> ? M : never;
export declare abstract class AbstractFetcher<T extends object> implements Fetcher<T> {
    private prev;
    private negative;
    private field;
    private args?;
    private child?;
    private str?;
    constructor(prev: AbstractFetcher<any> | undefined, negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<any>);
    protected addField<F extends AbstractFetcher<any>>(field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<any>): F;
    protected removeField<F extends AbstractFetcher<any>>(field: string): F;
    protected abstract createFetcher(prev: AbstractFetcher<any> | undefined, negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<any>): AbstractFetcher<any>;
    toString(): string;
    private toString0;
    private static appendIndentTo;
    private static appendFieldTo;
    __supressWarnings__(value: T): never;
}
