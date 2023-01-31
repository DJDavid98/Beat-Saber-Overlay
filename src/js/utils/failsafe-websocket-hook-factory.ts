import useWebSocket, { ReadyState } from "react-use-websocket";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Options as WebsocketOptions } from "react-use-websocket/src/lib/types";

const reconnectInterval = 1e3;

const onReconnectStop = () => {
    window.location.reload();
}

/**
 * Creates a failsafe websocket hook with an optional message handler, which, when defined, is used
 * to receive the data on the caller side instead of keeping the last json value memoized.
 */
export const failsafeWebsocketHookFactory = <ReturnValue>(
    validator: (data: unknown) => ReturnValue | null,
    messageHandler?: (message: ReturnValue | null) => void
) =>
    (
        url: string,
        reloadOnFail = false,
    ): { message: null | ReturnValue; readyState: ReadyState } => {
        const reloadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
        const clearReloadTimeout = useCallback(() => {
            if (reloadTimeout.current !== null) {
                clearTimeout(reloadTimeout.current);
                reloadTimeout.current = null;
            }
        }, []);
        const startReloadTimeout = useCallback(() => {
            // Reload the page in case the connection stops for much longer than the reconnect interval
            clearReloadTimeout();
            if (reloadOnFail) {
                reloadTimeout.current = setTimeout(onReconnectStop, reconnectInterval * 5);
            }
        }, [reloadOnFail]);
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
            onReconnectStop: reloadOnFail ? onReconnectStop : undefined,
            onOpen: clearReloadTimeout,
            onClose: startReloadTimeout,
        }), [messageHandler, reloadOnFail, clearReloadTimeout, startReloadTimeout]);
        const { lastJsonMessage, readyState } = useWebSocket(url, websocketOptions);

        // Technically this is a conditional hook call, but it's mitigated by using a factory function to get the hook
        const message = messageHandler ? null : useMemo(() => validator(lastJsonMessage), [validator, lastJsonMessage]);

        useEffect(() => {
            switch (readyState) {
                case ReadyState.CONNECTING:
                case ReadyState.OPEN:
                    clearReloadTimeout();
                    break;
                default:
                    startReloadTimeout();
            }
        }, [readyState, startReloadTimeout]);

        return { message, readyState };
    };
