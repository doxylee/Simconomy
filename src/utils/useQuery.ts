import { useEffect, useRef, useState } from "react";
import isEqual from "lodash/isEqual";

type Options = {
    enabled?: any;
};

export function useQuery<P, R>(queryFn: ((p: P) => R | Promise<R>) | undefined, param: P, options: Options = {}) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<R>();
    const memoizedParam = useDeepCompareMemoize(param);

    useEffect(() => {
        // enabled defaults to true only if non-existent
        if (!{ enabled: true, ...options }.enabled || queryFn === undefined) return;

        setIsLoading(true);
        let cancelled = false;
        const maybePromise = queryFn(param);
        if (isPromise(maybePromise))
            maybePromise.then((res) => {
                if (!cancelled) {
                    setIsLoading(false);
                    setData(res);
                }
            });
        else {
            setIsLoading(false);
            setData(maybePromise);
        }
    }, [queryFn === undefined, memoizedParam]);

    return { data, isLoading };
}

function isPromise<T>(x: T | Promise<T>): x is Promise<T> {
    // @ts-ignore
    return x && typeof x.then === "function";
}

function useDeepCompareMemoize(value: any) {
    const ref = useRef();
    if (!isEqual(value, ref.current)) ref.current = value;
    return ref.current;
}
