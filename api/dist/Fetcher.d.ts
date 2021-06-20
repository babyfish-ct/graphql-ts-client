export interface Fetcher<T extends object> {
    __supressWarnings__(value: T): never;
    readonly graphql: string;
}
export declare type ModelType<F> = F extends Fetcher<infer M> ? M : never;
export declare abstract class AbstractFetcher<T extends object> implements Fetcher<T> {
    private _prev;
    private _negative;
    private _field;
    private _args?;
    private _child?;
    private str?;
    constructor(_prev: AbstractFetcher<any> | undefined, _negative: boolean, _field: string, _args?: {
        [key: string]: any;
    }, _child?: AbstractFetcher<any>);
    protected addField<F extends AbstractFetcher<any>>(field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<any>): F;
    protected removeField<F extends AbstractFetcher<any>>(field: string): F;
    protected abstract createFetcher(prev: AbstractFetcher<any> | undefined, negative: boolean, field: string, args?: {
        [key: string]: any;
    }, child?: AbstractFetcher<any>): AbstractFetcher<any>;
    get graphql(): string;
    private graphql0;
    private static appendIndentTo;
    private static appendFieldTo;
    __supressWarnings__(value: T): never;
}
