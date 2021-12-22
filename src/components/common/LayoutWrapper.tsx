import React from "react";
import NoLayout from "@src/components/common/NoLayout";
import NavigationLayout from "@src/components/common/NavigationLayout";

const layouts = {
    default: NavigationLayout,
    none: NoLayout,
    navigation: NavigationLayout,
};

type LayoutTypes = "none" | "navigation";

interface Props {
    children: React.ReactNode & {
        type?: {
            layout?: LayoutTypes;
        };
    };
}

export default function LayoutWrapper({ children }: Props) {
    const Layout = layouts[children?.type?.layout || "default"] || layouts["default"];
    return <Layout>{children}</Layout>;
}
