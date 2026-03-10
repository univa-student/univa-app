/**
 * app/config/env.ts — backward-compat re-export shim.
 * All values now live in app.config.ts. Import from there directly.
 */
export {
    API_BASE_URL,
    APP_NAME,
    APP_VERSION,
    APP_ENV,
    IS_DEV,
    WS_HOST,
    WS_PORT,
    WS_KEY,
} from "./app.config";
