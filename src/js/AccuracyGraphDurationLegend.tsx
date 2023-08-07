import { FC } from 'react';
import { widerTimestampsSecondsThreshold } from './utils/constants';
import { useDurationFormatTimer } from './hooks/use-duration-format-timer';

export const AccuracyGraphDurationLegend: FC<{
    songLength: number | undefined,
}> = ({ songLength }) => {
    const df = useDurationFormatTimer();

    if (typeof songLength !== 'number') return null;

    const isWider = songLength > widerTimestampsSecondsThreshold;
    return (
        <span className="accuracy-graph-duration graph-legend-wrapper">
            <span className="graph-legend"><span>{df.format(0)}</span></span>
            {isWider &&
                <span className="graph-legend"><span>{df.format(songLength * 0.25)}</span></span>}
            <span className="graph-legend"><span>{df.format(songLength * 0.5)}</span></span>
            {isWider &&
                <span className="graph-legend"><span>{df.format(songLength * 0.75)}</span></span>}
            <span className="graph-legend"><span>{df.format(songLength)}</span></span>
       </span>
    );
};
