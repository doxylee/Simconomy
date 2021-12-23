import React, { useContext } from "react";
import { ReactAdapter } from "@src/adapter/ReactAdapter";

type CoreContextType = { core: ReactAdapter | null; setCore: (core: ReactAdapter | null) => void };

const defaultCore: CoreContextType = {
    core: null,
    setCore() {
        throw new Error("setCore called without proper core context.");
    },
};

const CoreContext = React.createContext<CoreContextType>(defaultCore);

export const CoreProvider = CoreContext.Provider;

export function useSetCore() {
    const { setCore } = useContext(CoreContext);
    return setCore;
}

export function useCore() {
    const { core } = useContext(CoreContext);
    return core;
}
