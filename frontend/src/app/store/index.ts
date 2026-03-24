/**
 * app/store/index.ts
 *
 * Root store — re-exports entity-level Zustand stores.
 * Add new slices here as modules grow.
 */
export { authStore } from "@/modules/auth/model/auth-store";
export { userSettingsStore } from "@/modules/auth/model/settings-store";
