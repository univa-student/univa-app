/**
 * Named WS channels used across the app.
 *
 * Відповідає секції "Канали" в README.
 * Тут лише helpers для формування назв каналів.
 */

export const channels = {
    /** `private-user.{userId}` — персональні івенти/нотіфікації */
    user(userId: number | string): string {
        return `private-user.${userId}`;
    },

    /** `private-space.{spaceId}` — групові чати/події в спейсі */
    space(spaceId: number | string): string {
        return `private-space.${spaceId}`;
    },

    /** `private-file.{fileId}` — прогрес обробки/індексації файлу */
    file(fileId: number | string): string {
        return `private-file.${fileId}`;
    },
} as const;

export type ChannelName = ReturnType<(typeof channels)[keyof typeof channels]>;

