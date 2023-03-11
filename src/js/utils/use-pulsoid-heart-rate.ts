import { useCallback, useEffect, useState } from "react";
import { useFailsafeWebsocket } from "./use-failsafe-websocket";
import { validateHeartRate } from "./validate-heart-rate";
import { HeartRateHookCommonFields } from "./heart-rate-hook-common-fields";

export interface PulsoidHeartRate extends HeartRateHookCommonFields {
    changeToken: (newToken: string) => void;
    getToken: () => string | null;
}

const pulsoidTokenKey = 'pulsoid-token';
export const usePulsoidHeartRate = (): PulsoidHeartRate => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const {
        message: pulsoidData,
        readyState,
    } = useFailsafeWebsocket(accessToken ? `wss://dev.pulsoid.net/api/v1/data/real_time?access_token=${encodeURIComponent(accessToken)}` : null, validateHeartRate, Boolean(accessToken));
    const saveToken = useCallback((value: string) => {
        setAccessToken(value);
        localStorage.setItem(pulsoidTokenKey, value);
    }, []);
    const disconnect = useCallback(() => {
        // Temporarily set access token to null to avoid connection
        setAccessToken(null);
    }, []);
    const getToken = useCallback(() => localStorage.getItem(pulsoidTokenKey), []);
    const changeToken = useCallback((result: string) => {
        const newToken = result.trim();
        console.debug('newToken', newToken);
        if (/^[a-f\d-]+$/.test(newToken)) {
            saveToken(newToken);
            return;
        } else {
            if (newToken === '') {
                localStorage.removeItem(pulsoidTokenKey);
            }
            disconnect();
        }
    }, [saveToken, disconnect]);

    useEffect(() => {
        setAccessToken(getToken());
    }, [getToken]);

    return {
        heartRate: pulsoidData?.data.heart_rate ?? null,
        deviceClass: 'pulsoid-bg',
        deviceName: 'Pulsoid',
        disconnect,
        readyState,
        changeToken,
        getToken,
    };
}
