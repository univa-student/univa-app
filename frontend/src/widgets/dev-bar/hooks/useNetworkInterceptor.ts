import { useState, useEffect, useRef, useCallback } from "react";
import type { NetworkEntry } from "../types";
import { MAX_NET } from "../constants";

export function useNetworkInterceptor() {
    const [entries, setEntries] = useState<NetworkEntry[]>([]);
    const id = useRef(0);

    const push = useCallback((entry: NetworkEntry) => {
        setEntries(prev => {
            const idx = prev.findIndex(e => e.id === entry.id);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = entry;
                return next;
            }
            return [entry, ...prev].slice(0, MAX_NET);
        });
    }, []);

    useEffect(() => {
        const orig = window.fetch;

        window.fetch = async (input, init) => {
            const eid = ++id.current;
            const method = (init?.method ?? "GET").toUpperCase();
            const url = typeof input === "string" ? input
                : input instanceof URL ? input.href
                    : (input as Request).url;
            const ts = Date.now();

            // Capture request headers
            const headers: Record<string, string> = {};
            if (init?.headers) {
                if (init.headers instanceof Headers) {
                    init.headers.forEach((value, key) => {
                        headers[key] = value;
                    });
                } else if (Array.isArray(init.headers)) {
                    init.headers.forEach(([key, value]) => {
                        headers[key] = value;
                    });
                } else {
                    Object.assign(headers, init.headers);
                }
            }

            // Capture request body
            let requestBody: string | null = null;
            if (init?.body) {
                try {
                    if (typeof init.body === "string") {
                        requestBody = init.body;
                    } else if (init.body instanceof FormData) {
                        requestBody = "[FormData]";
                    } else if (init.body instanceof Blob) {
                        requestBody = "[Blob]";
                    } else {
                        requestBody = init.body.toString();
                    }
                } catch {
                    requestBody = "[Unable to capture]";
                }
            }

            push({
                id: eid,
                method,
                url,
                status: null,
                duration: null,
                ts,
                pending: true,
                headers,
                requestBody,
            });

            try {
                const res = await orig(input, init);

                // Capture response headers
                const responseHeaders: Record<string, string> = {};
                res.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });

                // Capture response size
                const contentLength = res.headers.get("content-length");
                const size = contentLength ? parseInt(contentLength, 10) : null;

                // Clone response to read body without consuming it
                const resClone = res.clone();
                let responseBody: string | null = null;

                try {
                    const contentType = res.headers.get("content-type") || "";

                    if (contentType.includes("application/json")) {
                        const json = await resClone.json();
                        responseBody = JSON.stringify(json, null, 2);
                    } else if (contentType.includes("text/")) {
                        responseBody = await resClone.text();
                        // Truncate if too long
                        if (responseBody.length > 10000) {
                            responseBody = responseBody.slice(0, 10000) + "\n... (truncated)";
                        }
                    } else if (contentType.includes("image/") || contentType.includes("video/")) {
                        responseBody = `[${contentType}]`;
                    } else {
                        responseBody = "[Binary data]";
                    }
                } catch (err) {
                    responseBody = "[Unable to parse response]";
                }

                push({
                    id: eid,
                    method,
                    url,
                    status: res.status,
                    duration: Date.now() - ts,
                    ts,
                    pending: false,
                    headers,
                    requestBody,
                    responseHeaders,
                    responseBody,
                    size,
                });

                return res;
            } catch (err: any) {
                push({
                    id: eid,
                    method,
                    url,
                    status: null,
                    duration: Date.now() - ts,
                    ts,
                    pending: false,
                    error: err?.message || "Network error",
                    headers,
                    requestBody,
                });
                throw err;
            }
        };

        return () => {
            window.fetch = orig;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        entries,
        clear: () => setEntries([])
    };
}