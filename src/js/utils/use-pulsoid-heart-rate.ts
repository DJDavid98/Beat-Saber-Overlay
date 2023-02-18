import { useCallback, useEffect, useMemo, useState } from "react";
import { failsafeWebsocketHookFactory } from "./failsafe-websocket-hook-factory";
import { validateHeartRate } from "./validate-heart-rate";
import { ReadyState } from "react-use-websocket";
import { HeartRateHookCommonFields } from "./heart-rate-hook-common-fields";

export interface PulsoidHeartRate extends HeartRateHookCommonFields {
    readyState: ReadyState;
    changeToken: VoidFunction;
}

const pulsoidTokenKey = 'pulsoid-token';
export const usePulsoidHeartRate = (): PulsoidHeartRate => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const useFailsafeWebsocket = useMemo(() => failsafeWebsocketHookFactory(validateHeartRate), []);
    const {
        message: pulsoidData,
        readyState,
    } = useFailsafeWebsocket(accessToken ? `wss://dev.pulsoid.net/api/v1/data/real_time?access_token=${encodeURIComponent(accessToken)}` : undefined);
    const saveToken = useCallback((value: string) => {
        setAccessToken(value);
        localStorage.setItem(pulsoidTokenKey, value);
    }, []);
    const disconnect = useCallback(() => {
        // Temporarily set access token to null to avoid connection
        setAccessToken(null);
    }, []);
    const changeToken = useCallback(() => {
        const result = prompt('Enter Pulsoid API token:', accessToken ?? undefined);
        if (result === null) return;

        const newToken = result.trim();
        if (/^[a-f\d-]+$/.test(newToken)) {
            saveToken(newToken);
            return;
        } else {
            disconnect();
        }
    }, [accessToken, saveToken, disconnect]);

    useEffect(() => {
        setAccessToken(localStorage.getItem(pulsoidTokenKey));
    }, []);

    return {
        heartRate: pulsoidData?.data.heart_rate ?? null,
        className: 'pulsoid-bg',
        deviceName: 'Pulsoid',
        disconnect,
        readyState,
        changeToken,
    };
}
