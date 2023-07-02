import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Options as WebsocketOptions } from 'react-use-websocket/src/lib/types';
import { useRemountContext } from '../utils/remount-context';
import { JsonValue, WebSocketHook } from 'react-use-websocket/src/lib/types';

const reconnectInterval = 1e3;

/**
 * Creates a reconnecting websocket hook which can be used to receive the data on the caller side
 * and attempts to automatically recover when the connection closes, potentially by remounting
 * teh entire component
 */
export const useReconnectingWebsocket = <T extends JsonValue | null = JsonValue | null>(
    url: string | null,
    remountOnFail = false,
    onMessage?: WebsocketOptions['onMessage']
): WebSocketHook<T> => {
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
    const startRemountTimeout = useCallback(() => {
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
        onMessage,
        onClose: startRemountTimeout,
    }), [remountOnFail, beginRemount, clearRemountTimeout, onMessage, startRemountTimeout]);
    const webSocket = useWebSocket<T>(url, websocketOptions);
    const { readyState } = webSocket;

    useEffect(() => {
        switch (readyState) {
            case ReadyState.CONNECTING:
            case ReadyState.OPEN:
                clearRemountTimeout();
                break;
            default:
                startRemountTimeout();
        }
    }, [clearRemountTimeout, readyState, startRemountTimeout]);

    useEffect(() => {
        // Clear the timeout on remount
        return clearRemountTimeout;
    }, [clearRemountTimeout]);

    return webSocket;
};
