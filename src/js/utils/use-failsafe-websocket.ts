import Joi from "joi";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Options as WebsocketOptions } from "react-use-websocket/src/lib/types";

const reconnectInterval = 1e3;

const onReconnectStop = () => {
    window.location.reload();
}
export const useFailsafeWebsocket = <ReturnValue, ValidationSchema extends Joi.Schema<ReturnValue>>(
    url: string,
    validator: (data: unknown) => ReturnValue | null,
    reloadOnFail = false
) => {
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
        onReconnectStop: reloadOnFail ? onReconnectStop : undefined,
        onOpen: clearReloadTimeout,
        onClose: startReloadTimeout,
    }), [reloadOnFail, clearReloadTimeout, startReloadTimeout]);
    const { lastJsonMessage, readyState } = useWebSocket(url, websocketOptions);

    const message = useMemo(() => validator(lastJsonMessage), [validator, lastJsonMessage]);

    useEffect(() => {
        switch (readyState) {
            case ReadyState.CONNECTING:
            case ReadyState.OPEN:
                clearReloadTimeout();
                break;
            default:
                startReloadTimeout();
        }
    }, [readyState, startReloadTimeout])

    return { message, readyState };
}
