/**
 * app/store/index.ts
 *
 * Root store — re-exports entity-level Zustand stores.
 * Add new slices here as modules grow.
 */
export { authStore } from "@/entities/user/model/auth-store";
export { userSettingsStore } from "@/entities/user/model/settings-store";
