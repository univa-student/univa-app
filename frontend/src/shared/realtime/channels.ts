/**
 * shared/realtime/channels.ts
 *
 * Channel name helpers for all Laravel Echo / WebSocket channels.
 * Matches the README's recommended channel naming conventions.
 */

/** Personal notifications & events for a specific user. */
export const userChannel = (userId: number) => `user.${userId}`;

/** Group chat & events for a specific group. */
export const groupChannel = (groupId: number) => `group.${groupId}`;

/** File processing / indexing progress for a specific file (optional). */
export const fileChannel = (fileId: number) => `file.${fileId}`;
