import { useEffect } from "react";
import { APP_NAME } from "../../app/config/app.config.ts";

type Options = {
    suffix?: boolean; // додавати "| Univa"
};

function usePageTitle(title: string, options?: Options) {
    useEffect(() => {
        document.title = options?.suffix === false
            ? title
            : `${title} | ${APP_NAME}`;

        return () => {
            document.title = APP_NAME;
        };
    }, [title, options?.suffix]);
}

export default usePageTitle
