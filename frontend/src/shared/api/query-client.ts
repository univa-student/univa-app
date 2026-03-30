// src/shared/api/query-client.ts
import { QueryClient } from "@tanstack/react-query";
import { QUERY_RETRY, QUERY_STALE_MS } from "@/app/config/app.config.ts";
import { ApiError } from "@/shared/types/api";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (error instanceof ApiError && [400, 401, 403, 404, 409, 422, 429].includes(error.status)) {
                    return false;
                }

                return failureCount < QUERY_RETRY;
            },
            staleTime: QUERY_STALE_MS,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        }
    },
});

