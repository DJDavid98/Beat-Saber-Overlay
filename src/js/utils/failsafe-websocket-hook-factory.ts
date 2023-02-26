import useWebSocket, { ReadyState } from "react-use-websocket";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Options as WebsocketOptions } from "react-use-websocket/src/lib/types";
import { useRemountContext } from "./remount-context";

const reconnectInterval = 1e3;

/**
 * Creates a failsafe websocket hook with an optional message handler, which, when defined, is used
 * to receive the data on the caller side instead of keeping the last json value memoized.
 */
export const failsafeWebsocketHookFactory = <ReturnValue>(
    validator: (data: unknown) => ReturnValue | null,
    messageHandler?: (message: ReturnValue | null) => void
) =>
    (
        url: string | null,
        remountOnFail = false,
    ): { message: null | ReturnValue; readyState: ReadyState } => {
        const remountTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
        const { remount } = useRemountContext();
        const onReconnectStop = useCallback(() => {
            remount();
        }, [remount]);
        const clearReloadTimeout = useCallback(() => {
            if (remountTimeout.current !== null) {
                clearTimeout(remountTimeout.current);
                remountTimeout.current = null;
            }
        }, []);
        const startReloadTimeout = useCallback(() => {
            // Remount the app in case the connection stops for much longer than the reconnect interval
            clearReloadTimeout();
            if (remountOnFail) {
                remountTimeout.current = setTimeout(onReconnectStop, reconnectInterval * 5);
            }
        }, [clearReloadTimeout, onReconnectStop, remountOnFail]);
        const websocketOptions: WebsocketOptions = useMemo(() => ({
            reconnectAttempts: Infinity,
            retryOnError: true,
            reconnectInterval,
            onMessage: messageHandler && ((e) => {
                let jsonData = e.data;
                try {
                    if (typeof jsonData === 'string') {
                        jsonData = JSON.parse(jsonData);
                    }
                } catch (e) {
                    console.error(e);
                }
                messageHandler(validator(jsonData));
            }),
            onReconnectStop: remountOnFail ? onReconnectStop : undefined,
            onOpen: clearReloadTimeout,
            onClose: startReloadTimeout,
        }), [remountOnFail, onReconnectStop, clearReloadTimeout, startReloadTimeout]);
        const { lastJsonMessage, readyState } = useWebSocket(url, websocketOptions);

        // Technically this is a conditional hook call, but it's mitigated by using a factory function to get the hook
        const message = messageHandler ? null : useMemo(() => validator(lastJsonMessage), [lastJsonMessage]);

        useEffect(() => {
            switch (readyState) {
                case ReadyState.CONNECTING:
                case ReadyState.OPEN:
                    clearReloadTimeout();
                    break;
                default:
                    startReloadTimeout();
            }
        }, [clearReloadTimeout, readyState, startReloadTimeout]);

        return { message, readyState };
    };
