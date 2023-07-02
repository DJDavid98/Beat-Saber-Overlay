import { FC } from 'react';
import { BleHeartRate } from '../hooks/use-ble-heart-rate';
import { PulsoidHeartRate } from '../hooks/use-pulsoid-heart-rate';
import { HeartRateConnectionPulsoid } from './HeartRateConnectionPulsoid';
import { ReadyState } from 'react-use-websocket';
import { Loading } from '../Loading';
import { HeartRateConnectionWebsocket } from './HeartRateConnectionWebsocket';
import { WebsocketHeartRate } from '../hooks/use-websocket-heart-rate';

export interface HeartRateSourcesProps {
    bleHeartRate: BleHeartRate;
    pulsoidHeartRate: PulsoidHeartRate;
    websocketHeartRate: WebsocketHeartRate;
}

export const HeartRateSources: FC<HeartRateSourcesProps> = ({ bleHeartRate, pulsoidHeartRate, websocketHeartRate }) => {
    return <>
        <span className="label">Available Heart Rate Sources</span>
        <div className="connections">
            {bleHeartRate.supported && (
                bleHeartRate.readyState === ReadyState.CONNECTING
                    ? <Loading id="ble-loading" />
                    : <button
                        id="ble-connect"
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
