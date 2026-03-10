/**
 * app/providers/ws-provider.tsx
 *
 * Provides the WebSocket client to the app.
 * Connects after the user is authenticated, disconnects on logout.
 */
import React, { createContext, useContext, useEffect, useRef } from "react";
import { wsClient } from "@/shared/realtime/ws-client";
import { authStore } from "@/entities/user/model/auth-store";
import { ENABLE_WS } from "@/app/config/feature-flags";

interface WsContextValue {
    isEnabled: boolean;
}

const WsContext = createContext<WsContextValue>({ isEnabled: false });

export function useWs(): WsContextValue {
    return useContext(WsContext);
}

export function WsProvider({ children }: { children: React.ReactNode }) {
    const connectedRef = useRef(false);

    useEffect(() => {
        if (!ENABLE_WS) return;

        const handleStoreChange = () => {
            const { user, isReady } = authStore.getState();

            if (isReady && user && !connectedRef.current) {
                wsClient.connect();
                connectedRef.current = true;
            }

            if (isReady && !user && connectedRef.current) {
                wsClient.disconnect();
                connectedRef.current = false;
            }
        };

        // Check immediately (authStore may already be ready)
        handleStoreChange();

        return authStore.subscribe(handleStoreChange);
    }, []);

    return (
        <WsContext.Provider value={{ isEnabled: ENABLE_WS }}>
            {children}
        </WsContext.Provider>
    );
}
