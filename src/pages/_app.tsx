import type { AppProps } from "next/app";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

import "tailwindcss/tailwind.css";
import LayoutWrapper from "@src/components/common/LayoutWrapper";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { CoreProvider } from "@src/utils/useCore";
import { useEffect, useState } from "react";
import { ReactAdapter } from "@src/adapter/ReactAdapter";
import { SnackbarProvider } from "notistack";
import { runDummyScenario, useDummyData } from "@src/dummy/useDummyData";

const cache = createCache({
    key: "css",
    prepend: true,
});

const theme = createTheme({
    typography: {
        button: {
            textTransform: "none",
        },
    },
});

export default function SimconomyApp({ Component, pageProps }: AppProps) {
    const [core, setCore] = useState<ReactAdapter | null>(null);
    useEffect(() => {
        const core = new ReactAdapter();
        window.core = core;
        core.initialize()
            .then(() => runDummyScenario(core))
            .then(() => setCore(core));
    }, []);

    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <CoreProvider value={{ core, setCore }}>
                    <SnackbarProvider>
                        <LayoutWrapper>
                            <Component {...pageProps} />
                        </LayoutWrapper>
                    </SnackbarProvider>
                </CoreProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}
