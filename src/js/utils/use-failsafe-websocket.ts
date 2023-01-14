import Joi from "joi";
import useWebSocket from "react-use-websocket";
import { useCallback, useMemo, useRef } from "react";

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
    const { lastJsonMessage, readyState } = useWebSocket(url, {
        reconnectAttempts: Infinity,
        retryOnError: true,
        reconnectInterval,
        onReconnectStop: reloadOnFail ? onReconnectStop : undefined,
        onOpen: clearReloadTimeout,
        onClose: () => {
            // Reload the page in case the connection stops for much longer than the reconnect interval
            clearReloadTimeout();
            if (reloadOnFail) {
                reloadTimeout.current = setTimeout(onReconnectStop, reconnectInterval * 5);
            }
        }
    });

    const message = useMemo(() => validator(lastJsonMessage), [lastJsonMessage]);

    return { message, readyState };
}
