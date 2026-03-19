import { useEffect } from "react";
import { APP_NAME } from "@/app/config/app.config";

type Options = {
    suffix?: boolean;
};

export function usePageTitle(title: string, options?: Options) {
    const suffix = options?.suffix !== false;

    useEffect(() => {
        const prevTitle = document.title;

        document.title = suffix
            ? `${title} | ${APP_NAME}`
            : title;

        return () => {
            document.title = prevTitle;
        };
    }, [title, suffix]);
}