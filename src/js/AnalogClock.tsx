import { CSSProperties, FC, useMemo } from 'react';

interface LoadingIndicatorProps {
    size?: number;
    color?: string;
    square?: boolean;
    secondsSinceMidnight: number;
}

export const AnalogClock: FC<LoadingIndicatorProps> = ({
    size = 58,
    color,
    square = false,
    secondsSinceMidnight
}) => {
    const style = useMemo(() => {
        const sizeRem = `${size / 16}rem`;
        return {
            width: sizeRem,
            height: sizeRem,
            color,
        } as CSSProperties;
    }, [color, size]);

    const { hourHandStyle, minuteHandStyle, secondHandStyle } = useMemo(() => {
        const secondsRatio = secondsSinceMidnight / 60;
        const minutesRatio = secondsRatio / 60;
        const hoursRatio = secondsSinceMidnight / 12 / 60 / 60;
        return {
            secondHandStyle: { transform: `rotate(${360 * secondsRatio}deg)` },
            minuteHandStyle: { transform: `rotate(${360 * minutesRatio}deg)` },
            hourHandStyle: { transform: `rotate(${360 * hoursRatio}deg)` }
        };
    }, [secondsSinceMidnight]);

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            className="analog-clock"
            viewBox="0 0 64 64"
            style={style}
        >
            <path
                d="M32 32l0-25" className="second-hand"
                style={secondHandStyle}
            />
            <path
                d="M35 32a3.001 3.001 0 0 1-6 0l3-26.074L35 32Z"
                className="minute-hand"
                style={minuteHandStyle}
            />
            <path
                d="M35 32a3.001 3.001 0 0 1-6 0l3-13.037L35 32Z"
                className="hour-hand"
                style={hourHandStyle}
            />
            <g className="clock-base">
                <rect
                    x="3"
                    y="3"
                    width="58"
                    height="58"
                    rx={square ? 12 : 32}
                    className="clock-face"
                />
                <path d="M32 3v7m0 44v7m22-29h7M3 32h7" className="clock-ticking" />
            </g>
        </svg>
    );
};
