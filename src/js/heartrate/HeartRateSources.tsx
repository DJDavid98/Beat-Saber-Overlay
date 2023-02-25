import { FC } from "react";
import { BleHeartRate } from "../utils/use-ble-heart-rate";
import { PulsoidHeartRate } from "../utils/use-pulsoid-heart-rate";
import { HeartRateConnectionPulsoid } from "./HeartRateConnectionPulsoid";
import { ReadyState } from "react-use-websocket";
import { Loading } from "../Loading";

export interface HeartRateSourcesProps {
    bleHeartRate: BleHeartRate;
    pulsoidHeartRate: PulsoidHeartRate;
}

export const HeartRateSources: FC<HeartRateSourcesProps> = ({ bleHeartRate, pulsoidHeartRate }) => {
    return <>
        <span className="device-name">Available Heart Rate Sources</span>
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
        </div>
    </>
};
