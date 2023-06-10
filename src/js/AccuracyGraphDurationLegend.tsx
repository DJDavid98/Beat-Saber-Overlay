import { FC, useMemo } from "react";
import DurationUnitFormat from "intl-unofficial-duration-unit-format";
import { widerTimestampsSecondsThreshold } from "./utils/constants";

export const AccuracyGraphDurationLegend: FC<{
    songLength: number | undefined,
}> = ({ songLength }) => {
    const df = useMemo(() => new DurationUnitFormat('en-US', { style: "timer" }), []);

    if (typeof songLength !== 'number') return null;

    const isWider = songLength > widerTimestampsSecondsThreshold;
    return (
        <span id="accuracy-graph-duration" className="graph-legend-wrapper">
            <span className="graph-legend"><span>{df.format(0)}</span></span>
            {isWider && <span className="graph-legend"><span>{df.format(songLength * 0.25)}</span></span>}
            <span className="graph-legend"><span>{df.format(songLength * 0.5)}</span></span>
            {isWider && <span className="graph-legend"><span>{df.format(songLength * 0.75)}</span></span>}
            <span className="graph-legend"><span>{df.format(songLength)}</span></span>
       </span>
    );
}
