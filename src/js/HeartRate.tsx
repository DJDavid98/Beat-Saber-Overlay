import { CSSProperties, FC, useMemo } from "react";
import { ReadyState } from "react-use-websocket";
import { failsafeWebsocketHookFactory } from "./utils/failsafe-websocket-hook-factory";
import { validateHeartRate } from "./utils/validate-heart-rate";

const backgroundPosition = (value: number) => value === 0 ? 0 : `-${value}em`;
export const HeartRate: FC<{ accessToken: string }> = ({ accessToken }) => {
    const useFailsafeWebsocket = useMemo(() => failsafeWebsocketHookFactory(validateHeartRate), []);
    const {
        message: pulsoidData,
        readyState
    } = useFailsafeWebsocket(`wss://dev.pulsoid.net/api/v1/data/real_time?access_token=${encodeURIComponent(accessToken)}`);


    const heartRate = pulsoidData?.data.heart_rate;

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

    if (!numbers || !styles || readyState !== ReadyState.OPEN) return null;

    return <div id="heart-rate">
        <span className="heart" />
        {!!numbers?.hundreds && (
            <span className="rate-number hundreds" style={styles.hundreds} data-value={numbers.hundreds} />
        )}
        <span className="rate-number tens" style={styles.tens} data-value={numbers.tens} />
        <span className="rate-number units" style={styles.units} data-value={numbers.units} />
    </div>
};
