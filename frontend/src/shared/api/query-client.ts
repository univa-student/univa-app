// src/shared/api/query-client.ts
import { QueryClient } from "@tanstack/react-query";
import { QUERY_RETRY, QUERY_STALE_TIME } from "../../app/config/app.config.ts";

export const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: QUERY_RETRY, staleTime: QUERY_STALE_TIME } },
});
