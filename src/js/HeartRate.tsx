import { CSSProperties, FC, useMemo } from "react";
import { usePulsoidHeartRate } from "./utils/use-pulsoid-heart-rate";
import { useBleHeartRate } from "./utils/use-ble-heart-rate";

const backgroundPosition = (value: number) => value === 0 ? 0 : `-${value}em`;
export const HeartRate: FC<{ accessToken?: string }> = () => {
    const pulsoidHeartRate = usePulsoidHeartRate();
    const bleHeartRate = useBleHeartRate();

    const {
        heartRate,
        className: heartRateDeviceClass,
        deviceName,
        disconnect,
    } = bleHeartRate.heartRate ? bleHeartRate : pulsoidHeartRate;

    const numbers = useMemo(() => {
        if (!heartRate) return undefined;

        const hundreds = Math.floor(heartRate / 100);
        const tens = Math.floor((heartRate % 100) / 10);
        const units = heartRate % 10;
        return { hundreds, tens, units };
    }, [heartRate]);

    const styles = useMemo(() => {
        if (!numbers) return undefined;

        const hundreds: CSSProperties = { backgroundPositionX: backgroundPosition(numbers.hundreds) };
        const tens: CSSProperties = { backgroundPositionX: backgroundPosition(numbers.tens) };
        const units: CSSProperties = { backgroundPositionX: backgroundPosition(numbers.units) };
        return { hundreds, tens, units };
    }, [numbers]);

    const heartRateNumberShown = numbers && styles;

    return <div id="heart-rate" className={heartRateNumberShown ? 'show' : undefined}>
        {heartRateNumberShown ? (
            <>
                {deviceName && (
                    <button className="device-name" onClick={disconnect} title="Change source">
                        <span className={`device-icon ${heartRateDeviceClass}`} />
                        {deviceName}
                    </button>
                )}
                <div className="display">
                    <span className="heart" />
                    {!!numbers?.hundreds && (
                        <span className="rate-number hundreds" style={styles.hundreds} data-value={numbers.hundreds} />
                    )}
                    <span className="rate-number tens" style={styles.tens} data-value={numbers.tens} />
                    <span className="rate-number units" style={styles.units} data-value={numbers.units} />
                </div>
            </>
        ) : (
            <>
                <span className="device-name">Heart Rate Sources</span>
                <div className="connections">
                    <button id="ble-connect"
                            className={bleHeartRate.className}
                            onClick={bleHeartRate.connect}
                            title="Connect BLE Heart Rate Sensor" />
                    <button id="pulsoid-token"
                            className={pulsoidHeartRate.className}
                            onClick={pulsoidHeartRate.changeToken}
                            title="Set Pulsoid Token" />
                </div>
            </>)}
    </div>
};
