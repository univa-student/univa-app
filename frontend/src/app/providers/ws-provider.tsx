import React, { createContext, useContext, useEffect } from "react";
import { wsClient } from "@/shared/realtime/ws-client";
import { authStore } from "@/modules/auth/model/auth-store";
import { ENABLE_WS } from "@/app/config/feature-flags";

interface WsContextValue {
    isEnabled: boolean;
}

const WsContext = createContext<WsContextValue>({ isEnabled: false });

export function useWs(): WsContextValue {
    return useContext(WsContext);
}

export function WsProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (!ENABLE_WS) return;

        const sync = () => {
            const { user, isReady } = authStore.getState();

            if (!isReady) return;

            if (user && !wsClient.isConnected) {
                wsClient.connect();
            }

            if (!user && wsClient.isConnected) {
                wsClient.disconnect();
            }
        };

        sync(); // initial sync

        const unsubscribe = authStore.subscribe(sync);

        return () => {
            unsubscribe();
            if (wsClient.isConnected) {
                wsClient.disconnect();
            }
        };
    }, []);

    return (
        <WsContext.Provider value={{ isEnabled: ENABLE_WS }}>
            {children}
        </WsContext.Provider>
    );
}