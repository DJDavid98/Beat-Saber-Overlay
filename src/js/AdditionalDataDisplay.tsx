import { FC, useEffect, useMemo, useRef, useState } from "react";
import { DataPoint, drawAccuracyGraph } from "./utils/draw-accuracy-graph";
import { AdditionalDataModifiers } from "./AdditionalDataModifiers";
import { Modifiers } from "./model/modifiers";
import { LiveData } from "./model/live-data";
import { accuracyColorGraphStyleFactory } from "./utils/graph-styles";
import { weightedColorMixerFactory } from "./utils/weighted-color-mix";
import { GradientStop } from "./class/gradient-stop.class";
import { mapAccuracyRating } from "./utils/mappers";

const accuracyGradient: GradientStop[] = [
    new GradientStop('#ff0000', 0),
    new GradientStop('#ff0000', 20),
    new GradientStop('#ff8000', 35),
    new GradientStop('#ffeb00', 50),
    new GradientStop('#00ff00', 65),
    new GradientStop('#ffffff', 80),
    new GradientStop('#00ffff', 90),
    new GradientStop('#00ffff', 100),
];

export interface AdditionalDataDisplayProps {
    modifiers?: Modifiers;
    songLength?: number;
    liveData?: LiveData;
    /**
     * Signal boolean which is flipped each time the additional data component should reset its internal state
     */
    reset?: boolean;
}

export const AdditionalDataDisplay: FC<AdditionalDataDisplayProps> = ({
    modifiers,
    songLength,
    liveData,
    reset
}) => {
    const dataPoints = useRef<DataPoint[] | null>();
    const startFromSeconds = useRef<number | null>(null);
    const [accuracy, setAccuracy] = useState<string | undefined>();
    const accCanvas = useRef<HTMLCanvasElement | null>(null);
    const nf = useMemo(() => new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }), []);
    const colorMixer = useMemo(() => weightedColorMixerFactory(accuracyGradient), []);
    const [accuracyRating, accuracyStyle] = useMemo(() => {
        const accuracyValue = liveData?.accuracy ?? 0;
        return [
            mapAccuracyRating(accuracyValue),
            { color: colorMixer(accuracyValue) }
        ];
    }, [colorMixer, liveData?.accuracy]);

    useEffect(() => {
        if (!liveData) {
            return;
        }
        setAccuracy(nf.format(liveData.accuracy / 100));

        if (!dataPoints.current) {
            return;
        } else if (liveData.timeElapsed === 0) {
            // This is the first score update for the current map, assume we must clear the data points
            dataPoints.current = [];
            startFromSeconds.current = null;
        }
        const dataPoint: DataPoint = { seconds: liveData.timeElapsed, accuracy: liveData.accuracy };
        if (startFromSeconds.current === null) {
            startFromSeconds.current = dataPoint.seconds;
        }
        dataPoints.current.push(dataPoint);
        if (accCanvas.current && songLength) {
            drawAccuracyGraph(
                accCanvas.current,
                dataPoints.current,
                songLength,
                startFromSeconds.current,
                accuracyColorGraphStyleFactory(colorMixer)
            );
        }
    }, [colorMixer, liveData, nf, songLength]);

    useEffect(() => {
        if (!reset) return;

        // Clear data points on song change
        dataPoints.current = [];
        startFromSeconds.current = null;
    }, [reset]);

    // Change accuracy graph width based on song length, between a sane minimum and maximum value
    const accuracyGraphLength = useMemo(() => songLength ? Math.max(60, Math.min(400, songLength * 2)) : 0, [songLength]);

    return <>
        {accuracyGraphLength > 0 && (
            <div>
                <div id="accuracy-label">
                    <span>{accuracy} Accuracy</span>
                    <span style={accuracyStyle}>{accuracyRating}</span>
                </div>
                <div id="accuracy-graph-wrapper">
                    <canvas width={accuracyGraphLength} height={40} ref={accCanvas} />
                </div>
            </div>
        )}
        <AdditionalDataModifiers modifiers={modifiers} />
    </>
}
