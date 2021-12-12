/**
 * Used to avoid race condition when using Repository.update.
 */
export class F<T> {
    add: T | undefined = undefined;

    constructor({ add }: { add: NonNullable<T> }) {
        this.add = add;
    }
}
