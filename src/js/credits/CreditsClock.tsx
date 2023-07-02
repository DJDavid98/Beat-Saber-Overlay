import { FC, useEffect, useMemo, useState } from 'react';
import { AnalogClock } from '../AnalogClock';
import classNames from 'classnames';

const getSecondsSinceMidnight = (hours: number, minutes: number, seconds: number) => {
    return seconds + (minutes * 60) + ((hours) * 60 * 60);
};

export const CreditsClock: FC<{ visibleTime: number }> = ({ visibleTime }) => {
    const [twelveHour, setTwelveHour] = useState(true);
    const [skipAnimation, setSkipAnimation] = useState(true);
    const dateFormatter = useMemo(() => new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full'
    }), []);
    const timeFormatter12 = useMemo(() => new Intl.DateTimeFormat('en-US', {
        hour12: true,
        timeStyle: 'medium'
    }), []);
    const timeFormatter24 = useMemo(() => new Intl.DateTimeFormat('en-US', {
        hour12: false,
        timeStyle: 'medium'
    }), []);
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timeUpdater = setInterval(() => setNow(new Date()), 500);

        return () => clearInterval(timeUpdater);
    }, []);

    useEffect(() => {
        const timeFormatUpdater = setTimeout(() => {
            setTwelveHour((state) => !state);
            setSkipAnimation(false);
        }, visibleTime / 4);

        return () => clearTimeout(timeFormatUpdater);
    }, [twelveHour, visibleTime]);

    const tz = useMemo(() => now.toLocaleDateString(undefined, {
        day: '2-digit',
        timeZoneName: 'short'
    }).substring(4), [now]);

    const { time, time12, secondsSinceMidnight } = useMemo(() => {
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const secondsSinceMidnight = getSecondsSinceMidnight(hours, minutes, seconds);
        return {
            time: timeFormatter24.format(now).replace(/^0/, ''),
            time12: timeFormatter12.format(now),
            secondsSinceMidnight
        };
    }, [now, timeFormatter12, timeFormatter24]);

    return <div id="credits-clock">
        <span className="time">
            <AnalogClock secondsSinceMidnight={secondsSinceMidnight} square />
            <div
                className={classNames('time-formats', { ['skip-animation']: skipAnimation })}
                data-format={twelveHour ? '12' : '24'}
            >
                <span className="time-value time-12 fix-alignment">{time12}</span>
                <span className="time-value time-24 fix-alignment">{time}</span>
            </div>
        </span>
        <span className="time-meta">
            <span>Local Time ({tz})</span>
            <span>{dateFormatter.format(now)}</span>
        </span>
    </div>;
};
