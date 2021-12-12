export type AwaitedType<T> = T extends PromiseLike<infer T> ? T : never;
export type RecurseAwaitedType<T> = T extends PromiseLike<infer U> ? RecurseAwaitedType<U> : T;
export type AwaitedReturnType<T extends (...args: any) => any> = AwaitedType<ReturnType<T>>;
export type RecurseAwaitedReturnType<T extends (...args: any) => any> = RecurseAwaitedType<ReturnType<T>>;

// Non negative integer: https://stackoverflow.com/a/69413070
