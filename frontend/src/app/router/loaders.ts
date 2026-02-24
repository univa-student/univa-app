import type { LoaderFunctionArgs } from "react-router-dom";
import { redirect } from "react-router-dom";

import { queryClient } from "../../shared/api/query-client";
import { authStore } from "../../entities/user/model/auth-store";
import { userQueries } from "../../entities/user/api/queries";
// import { filesQueries } from "../../entities/file/api/queries";
// import { spacesQueries } from "../../entities/space/api/queries";
// import { messagesQueries } from "../../entities/message/api/queries";
// import { lessonsQueries } from "../../entities/lesson/api/queries";
// import { tasksQueries } from "../../entities/task/api/queries";

/**
 * Принцип:
 * - root loader: перевіряє сесію, префетчить "me"
 * - сторінкові loaders: префетчать дані для сторінки в кеш TanStack Query
 * - guestOnly: не пускає на /login, якщо вже залогінений
 */
export const routesLoaders = {
    guestOnly: async () => {
        if (authStore.getState().isAuthenticated) return redirect("/dashboard");
        return null;
    },

    root: async ({ request }: LoaderFunctionArgs) => {
        const url = new URL(request.url);
        const pathname = url.pathname;

        const isAuthed = authStore.getState().isAuthenticated;
        if (!isAuthed) {
            // дозволяємо зайти на /login, але всі інші — редірект
            if (pathname !== "/login") throw redirect("/login");
            return null;
        }

        // підтягнути "me" (корисно для header/avatar/roles)
        await queryClient.ensureQueryData(userQueries.me());
        return null;
    },

    // dashboard: async () => {
    //     // приклад: дашборд = тижневий розклад + найближчі дедлайни
    //     await Promise.all([
    //         queryClient.ensureQueryData(lessonsQueries.week()),
    //         queryClient.ensureQueryData(tasksQueries.upcoming()),
    //     ]);
    //     return null;
    // },
    //
    // files: async () => {
    //     await queryClient.ensureQueryData(filesQueries.list());
    //     return null;
    // },
    //
    // spaces: async () => {
    //     await queryClient.ensureQueryData(spacesQueries.list());
    //     return null;
    // },
    //
    // chat: async () => {
    //     // якщо є активний space, можна префетчити історію
    //     const activeSpaceId = authStore.getState().activeSpaceId;
    //     if (activeSpaceId) {
    //         await queryClient.ensureQueryData(messagesQueries.history(activeSpaceId));
    //     }
    //     return null;
    // },
    //
    // schedule: async () => {
    //     await queryClient.ensureQueryData(lessonsQueries.week());
    //     return null;
    // },
    //
    // deadlines: async () => {
    //     await queryClient.ensureQueryData(tasksQueries.list());
    //     return null;
    // },
};