import type { AppProps } from "next/app";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

import "tailwindcss/tailwind.css";

const cache = createCache({
    key: "css",
    prepend: true,
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
