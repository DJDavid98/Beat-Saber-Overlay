import { FC } from "react";
import { usePulsoidHeartRate } from "../utils/use-pulsoid-heart-rate";
import { useBleHeartRate } from "../utils/use-ble-heart-rate";
import { HeartRateDisplay } from "./HeartRateDisplay";
import { HeartRateSources } from "./HeartRateSources";
import { ReadyState } from "react-use-websocket";
import { Bouncy } from "../Bouncy";

export const HeartRate: FC = () => {
    const pulsoidHeartRate = usePulsoidHeartRate();
    const bleHeartRate = useBleHeartRate();

    const {
        readyState,
        heartRate,
        deviceClass,
        deviceName,
        disconnect,
    } = bleHeartRate.readyState === ReadyState.OPEN || bleHeartRate.readyState === ReadyState.CONNECTING ? bleHeartRate : pulsoidHeartRate;

    const isInProgress = bleHeartRate.readyState === ReadyState.CONNECTING || pulsoidHeartRate.readyState === ReadyState.CONNECTING;
    const showSources = !heartRate;

    return <>
        <div id="heart-rate" className={heartRate || isInProgress ? 'show' : undefined}>
            {showSources && <HeartRateSources pulsoidHeartRate={pulsoidHeartRate} bleHeartRate={bleHeartRate} />}
            {(readyState === ReadyState.OPEN || isInProgress) && <HeartRateDisplay
                heartRate={heartRate}
                deviceName={deviceName}
                deviceClass={deviceClass}
                disconnect={disconnect}
            />}
        </div>
        <Bouncy heartRate={heartRate} />
    </>
};
