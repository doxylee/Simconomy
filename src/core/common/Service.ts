export class Service {
    /**
     * Bind all service methods to the service instance.
     * @protected
     */
    protected bindMethods() {
        const proto = Object.getPrototypeOf(this);
        for (const method of Object.getOwnPropertyNames(proto) as (keyof this)[]) {
            if (typeof proto[method] !== "function") continue;
            this[method] = (proto[method] as unknown as Function).bind(this);
        }
    }
}
