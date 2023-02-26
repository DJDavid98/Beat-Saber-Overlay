import useWebSocket, { ReadyState } from "react-use-websocket";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Options as WebsocketOptions } from "react-use-websocket/src/lib/types";
import { useRemountContext } from "./remount-context";

const reconnectInterval = 1e3;

/**
 * Creates a failsafe websocket hook with an optional message handler, which, when defined, is used
 * to receive the data on the caller side instead of keeping the last json value memoized.
 */
export const useFailsafeWebsocket = <ReturnValue, >(
    url: string | null,
    validator: (data: unknown) => ReturnValue | null,
    remountOnFail = false,
): { message: null | ReturnValue; readyState: ReadyState } => {
    const remountTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const remountingRef = useRef(false);
    const { remount } = useRemountContext();
    const beginRemount = useCallback(() => {
        remountingRef.current = true;
        remount();
    }, [remount]);
    const clearRemountTimeout = useCallback(() => {
        if (remountTimeout.current !== null) {
            clearTimeout(remountTimeout.current);
            remountTimeout.current = null;
        }
    }, []);
    const startReloadTimeout = useCallback(() => {
        // Remount the app in case the connection stops for much longer than the reconnect interval
        clearRemountTimeout();
        if (remountOnFail && !remountingRef.current) {
            remountTimeout.current = setTimeout(beginRemount, reconnectInterval * 5);
        }
    }, [clearRemountTimeout, beginRemount, remountOnFail]);
    const websocketOptions: WebsocketOptions = useMemo(() => ({
        reconnectAttempts: Infinity,
        retryOnError: true,
        reconnectInterval,
        onReconnectStop: remountOnFail ? beginRemount : undefined,
        onOpen: clearRemountTimeout,
        onClose: startReloadTimeout,
    }), [remountOnFail, beginRemount, clearRemountTimeout, startReloadTimeout]);
    const { lastJsonMessage, readyState } = useWebSocket(url, websocketOptions);

    const message = useMemo(() => validator(lastJsonMessage), [validator, lastJsonMessage]);

    useEffect(() => {
        switch (readyState) {
            case ReadyState.CONNECTING:
            case ReadyState.OPEN:
                clearRemountTimeout();
                break;
            default:
                startReloadTimeout();
        }
    }, [clearRemountTimeout, readyState, startReloadTimeout]);

    useEffect(() => {
        // Clear the timeout on remount
        return clearRemountTimeout;
    }, [clearRemountTimeout]);

    return { message, readyState };
};
