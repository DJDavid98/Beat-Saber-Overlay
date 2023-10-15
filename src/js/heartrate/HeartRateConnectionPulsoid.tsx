import { FC, useCallback } from 'react';
import { ReadyState } from 'react-use-websocket';
import { Loading } from '../Loading';
import { useSettings } from '../contexts/settings-context';
import { SettingsPage } from '../model/settings';
import { HeartRateHookCommonFields } from '../utils/heart-rate-hook-common-fields';

export const HeartRateConnectionPulsoid: FC<{
    pulsoidHeartRate: HeartRateHookCommonFields
}> = ({ pulsoidHeartRate }) => {
    const { openSettings } = useSettings();

    const showDialog = useCallback(() => {
        openSettings(SettingsPage.HEART_RATE);
    }, [openSettings]);

    return <>
        {pulsoidHeartRate.readyState === ReadyState.CONNECTING
            ? <Loading name="pulsoid" onClick={showDialog} />
            : <button
                className={`connection-button ${pulsoidHeartRate.deviceClass}`}
                onClick={showDialog}
                title="Set Pulsoid Token"
            />}
    </>;
};
