/**
 * shared/realtime/channels.ts
 *
 * Channel name helpers for all Laravel Echo / WebSocket channels.
 * Matches the README's recommended channel naming conventions.
 */

/** Personal notifications & events for a specific user. */
export const userChannel = (userId: number) => `private-user.${userId}`;

/** Group chat & events for a specific space. */
export const spaceChannel = (spaceId: number) => `private-space.${spaceId}`;

/** File processing / indexing progress for a specific file (optional). */
export const fileChannel = (fileId: number) => `private-file.${fileId}`;
