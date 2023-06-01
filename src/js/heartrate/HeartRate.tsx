import { FC } from "react";
import { usePulsoidHeartRate } from "../hooks/use-pulsoid-heart-rate";
import { useBleHeartRate } from "../hooks/use-ble-heart-rate";
import { HeartRateDisplay } from "./HeartRateDisplay";
import { HeartRateSources } from "./HeartRateSources";
import { ReadyState } from "react-use-websocket";
import { Bouncy } from "../Bouncy";
import { useWebsocketHeartRate } from "../hooks/use-websocket-heart-rate";

const connectingStatesSet = new Set([ReadyState.OPEN, ReadyState.CONNECTING])

export const HeartRate: FC = () => {
    const pulsoidHeartRate = usePulsoidHeartRate();
    const bleHeartRate = useBleHeartRate();
    const websocketHeartRate = useWebsocketHeartRate();

    const {
        readyState,
        heartRate,
        deviceClass,
        deviceName,
        disconnect,
    } = [websocketHeartRate, bleHeartRate].find(
        (item) => connectingStatesSet.has(item.readyState)
    ) ?? pulsoidHeartRate;

    const isInProgress = [websocketHeartRate, bleHeartRate, pulsoidHeartRate].some(rate => rate.readyState === ReadyState.CONNECTING);
    const showSources = !heartRate;

    return <>
        <div id="heart-rate" className={heartRate || isInProgress ? 'show' : undefined}>
            {showSources && <HeartRateSources
                pulsoidHeartRate={pulsoidHeartRate}
                bleHeartRate={bleHeartRate}
                websocketHeartRate={websocketHeartRate}
            />}
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
