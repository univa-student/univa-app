import { useQuery } from "@tanstack/react-query";
import { userQueries } from "./queries";

export function useMe() {
    return useQuery(userQueries.me());
}