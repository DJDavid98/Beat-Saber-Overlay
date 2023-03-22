import { ReadyState } from "react-use-websocket";
import { useMemo } from "react";
import { useReconnectingWebsocket } from "./use-reconnecting-websocket";

/**
 * Creates a failsafe websocket hook with an optional message handler, which, when defined, is used
 * to receive the data on the caller side instead of keeping the last json value memoized.
 */
export const useFailsafeWebsocket = <ReturnValue, >(
    url: string | null,
    validator: (data: unknown) => ReturnValue | null,
    remountOnFail = false,
): { message: null | ReturnValue; readyState: ReadyState } => {
    const { lastJsonMessage, readyState } = useReconnectingWebsocket(url, remountOnFail);

    const message = useMemo(() => validator(lastJsonMessage), [validator, lastJsonMessage]);

    return { message, readyState };
};
