import Document, { Head, Html, Main, NextScript } from "next/document";
import settings from "@src/settings";

export default class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <title>Simconomy</title>
                    {
                        // Google Analytics
                        settings.ENV && settings.GA4TrackingId && (
                            <>
                                <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.GA4TrackingId}`} />
                                <script
                                    dangerouslySetInnerHTML={{
                                        __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.GA4TrackingId}');`,
                                    }}
                                />
                            </>
                        )
                    }
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}