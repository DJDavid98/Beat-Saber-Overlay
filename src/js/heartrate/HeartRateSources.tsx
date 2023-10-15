import { FC } from 'react';
import { BleHeartRate } from '../hooks/use-ble-heart-rate';
import { HeartRateConnectionPulsoid } from './HeartRateConnectionPulsoid';
import { ReadyState } from 'react-use-websocket';
import { Loading } from '../Loading';
import { HeartRateConnectionWebsocket } from './HeartRateConnectionWebsocket';
import { HeartRateHookCommonFields } from '../utils/heart-rate-hook-common-fields';

export interface HeartRateSourcesProps {
    bleHeartRate: BleHeartRate;
    pulsoidHeartRate: HeartRateHookCommonFields;
    websocketHeartRate: HeartRateHookCommonFields;
}

export const HeartRateSources: FC<HeartRateSourcesProps> = ({
    bleHeartRate,
    pulsoidHeartRate,
    websocketHeartRate
}) => {
    return <>
        <span className="label">Available Heart Rate Sources</span>
        <div className="connections">
            {bleHeartRate.supported && (
                bleHeartRate.readyState === ReadyState.CONNECTING
                    ? <Loading name="ble" />
                    : <button
                        className={`connection-button ${bleHeartRate.deviceClass}`}
                        onClick={bleHeartRate.connect}
                        title="Connect BLE Heart Rate Sensor"
                    />
            )}

            <HeartRateConnectionPulsoid pulsoidHeartRate={pulsoidHeartRate} />

            <HeartRateConnectionWebsocket websocketHeartRate={websocketHeartRate} />
        </div>
    </>;
};
