import type { AppProps } from "next/app";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

import "tailwindcss/tailwind.css";
import LayoutWrapper from "@src/components/common/LayoutWrapper";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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
    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <LayoutWrapper>
                    <Component {...pageProps} />
                </LayoutWrapper>
            </ThemeProvider>
        </CacheProvider>
    );
}
