import classNames from 'classnames';
import { CSSProperties, FC, useMemo } from "react";
import { Loading } from "../Loading";

const backgroundPosition = (value: number) => value === 0 ? 0 : `-${value}em`;

export type HeartRateDigit = 'hundreds' | 'tens' | 'units';

export interface HeartRateDisplayProps {
    heartRate: number | null;
    deviceName?: string;
    deviceClass?: string
    disconnect: VoidFunction;
}

export const HeartRateDisplay: FC<HeartRateDisplayProps> = ({
    heartRate,
    deviceName,
    deviceClass,
    disconnect
}) => {
    const numbers = useMemo(() => {
        const [units = 0, tens = 0, hundreds = 0] = heartRate ? heartRate.toString().split('').reverse().map(Number) : [];
        return { hundreds, tens, units } satisfies Record<HeartRateDigit, number>;
    }, [heartRate]);

    const styles = useMemo(() => {
        const hundreds: CSSProperties = { backgroundPositionX: backgroundPosition(numbers.hundreds) };
        const tens: CSSProperties = { backgroundPositionX: backgroundPosition(numbers.tens) };
        const units: CSSProperties = { backgroundPositionX: backgroundPosition(numbers.units) };
        return { hundreds, tens, units } satisfies Record<HeartRateDigit, CSSProperties>;
    }, [numbers]);

    const isLoading = heartRate === null;

    return <>
        {deviceName && (
            <button
                className={classNames("label device-name", { connected: !isLoading })}
                onClick={disconnect}
                title="Change source"
            >
                <span className={`device-icon ${deviceClass}`} />
                {deviceName}
            </button>
        )}
        <div className="display">
            <span className="heart" />
            {isLoading
                ? <Loading id="heart-rate-loading" />
                : <>
                    {heartRate >= 100 && (
                        <span className="rate-number hundreds" style={styles.hundreds} data-value={numbers.hundreds} />
                    )}
                    {heartRate >= 10 && (
                        <span className="rate-number tens" style={styles.tens} data-value={numbers.tens} />
                    )}
                    <span className="rate-number units" style={styles.units} data-value={numbers.units} />
                </>}
        </div>
    </>
}
