export type AwaitedType<T> = T extends PromiseLike<infer T> ? T : never;
export type RecurseAwaitedType<T> = T extends PromiseLike<infer U> ? RecurseAwaitedType<U> : T;

// Non negative integer: https://stackoverflow.com/a/69413070
