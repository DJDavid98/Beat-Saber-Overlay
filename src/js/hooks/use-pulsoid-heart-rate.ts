import { useCallback, useEffect, useState } from 'react';
import { useFailsafeWebsocket } from './use-failsafe-websocket';
import { validatePulsoidHeartRate } from '../validators/validate-pulsoid-heart-rate';
import { HeartRateHookCommonFields } from '../utils/heart-rate-hook-common-fields';
import { useSettings } from '../contexts/settings-context';
import { SettingName } from '../model/settings';

export const usePulsoidHeartRate = (): HeartRateHookCommonFields => {
    const {
        settings: { [SettingName.PULSOID_TOKEN]: accessToken }
    } = useSettings();
    const [forceDisconnect, setForceDisconnect] = useState(false);
    const {
        message: pulsoidData,
        readyState,
    } = useFailsafeWebsocket(!forceDisconnect && accessToken ? `wss://dev.pulsoid.net/api/v1/data/real_time?access_token=${encodeURIComponent(accessToken)}` : null, validatePulsoidHeartRate, Boolean(accessToken));
    const disconnect = useCallback(() => {
        // Temporarily set access token to null to avoid connection
        setForceDisconnect(true);
    }, []);

    useEffect(() => {
        setForceDisconnect(false);
    }, [accessToken]);

    return {
        heartRate: pulsoidData?.data.heart_rate ?? null,
        deviceClass: 'pulsoid-bg',
        deviceName: 'Pulsoid',
        disconnect,
        readyState,
    };
};
