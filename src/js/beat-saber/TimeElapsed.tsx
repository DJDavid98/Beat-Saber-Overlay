import { FC, useEffect, useRef, useState } from 'react';
import { useDurationFormatTimer } from '../hooks/use-duration-format-timer';

export const TimeElapsed: FC<{ since: Date }> = ({ since }) => {
    const timerRef = useRef<null | ReturnType<typeof setInterval>>(null);
    const [now, setNow] = useState(() => new Date());
    const df = useDurationFormatTimer();

    useEffect(() => {
        const updateCurrentTime = () => setNow(new Date());
        updateCurrentTime();
        timerRef.current = setInterval(updateCurrentTime, 500);

        return () => {
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    const millisecondsElapsed = now.getTime() - since.getTime();

    return <span className="time-elapsed">{df.format(millisecondsElapsed / 1e3)} elapsed</span>;
};
