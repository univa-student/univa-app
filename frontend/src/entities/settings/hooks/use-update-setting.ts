import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSetting } from "@/entities/settings/api/settings.api";

interface UpdateSettingArgs {
    key: string;
    value: unknown;
}

/**
 * Mutation hook for updating a setting value.
 * On success: invalidates the React Query cache for the given groupId,
 * triggering a background re-fetch so the UI always shows fresh data.
 *
 * Usage:
 * ```tsx
 * const { mutate, isPending } = useUpdateSetting(4) // groupId = Appearance
 * mutate({ key: "appearance.theme", value: "dark" })
 * ```
 */
export function useUpdateSetting(groupId: number) {
    const queryClient = useQueryClient();

    return useMutation<void, Error, UpdateSettingArgs>({
        mutationFn: ({ key, value }) => updateSetting(key, value),
        onSuccess: () => {
            // Invalidate the group cache — triggers refetch in background
            queryClient.invalidateQueries({ queryKey: ["settings", groupId] });
        },
    });
}
