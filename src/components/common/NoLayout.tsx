import React from "react";

interface Props {
    children: React.ReactNode;
}

export default function NoLayout({ children }: Props) {
    return <>{children}</>;
}
