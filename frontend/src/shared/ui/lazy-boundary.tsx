import React, { Suspense } from "react";

export function LazyBoundary({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
            {children}
        </Suspense>
    );
}