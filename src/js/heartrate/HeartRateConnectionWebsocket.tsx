import { FC, useCallback } from 'react';
import { ReadyState } from 'react-use-websocket';
import { Loading } from '../Loading';
import { HeartRateHookCommonFields } from '../utils/heart-rate-hook-common-fields';
import { useSettings } from '../contexts/settings-context';
import { SettingsPage } from '../model/settings';

export const HeartRateConnectionWebsocket: FC<{
    websocketHeartRate: HeartRateHookCommonFields
}> = ({ websocketHeartRate }) => {
    const { openSettings } = useSettings();

    const showDialog = useCallback(() => {
        openSettings(SettingsPage.HEART_RATE);
    }, [openSettings]);

    return <>
        {websocketHeartRate.readyState === ReadyState.CONNECTING
            ? <Loading name="websocket" onClick={showDialog} />
            : <button
                className={`connection-button ${websocketHeartRate.deviceClass}`}
                onClick={showDialog}
                title="Websocket Options"
            />}
    </>;
};
