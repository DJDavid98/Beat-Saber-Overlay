import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataPoint, drawGraphs } from './utils/draw-graphs';
import { AdditionalDataModifiers } from './AdditionalDataModifiers';
import { Modifiers } from './model/modifiers';
import { LiveData } from './model/live-data';
import {
    barGraphStyleFactory,
    crossGraphStyleFactory,
    lineGraphStyleFactory
} from './utils/graph-styles';
import { weightedColorMixerFactory } from './utils/weighted-color-mix';
import { GradientStop } from './class/gradient-stop.class';
import { dataPointToAccuracy, dataPointToMisses, mapAccuracyRating } from './utils/mappers';
import { EnergyIcon } from './beat-saber/EnergyIcon';
import { AccuracyGraphDurationLegend } from './AccuracyGraphDurationLegend';

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

const energyGradient: GradientStop[] = [
    new GradientStop('#ff0000', 0),
    new GradientStop('#ffff00', 25),
    new GradientStop('#ffffff', 50),
    new GradientStop('#ffffff', 85),
    new GradientStop('#00ffff', 100),
];

/**
 * Used to perform super sampling (rendering the canvas at a larger size but displaying it scaled down)
 */
const graphScale = 2;
const graphHeight = 80;

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
    const [energy, setEnergy] = useState<number | undefined>();
    const [graphRange, setGraphRange] = useState<number>(100);
    const graphCanvas = useRef<HTMLCanvasElement | null>(null);
    const nf = useMemo(() => new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }), []);
    const accuracyColorMixer = useMemo(() => weightedColorMixerFactory(accuracyGradient, false), []);
    const energyColorMixer = useMemo(() => weightedColorMixerFactory(energyGradient), []);
    const [accuracyRating, accuracyStyle] = useMemo(() => {
        const accuracyValue = liveData?.accuracy ?? 0;
        return [
            mapAccuracyRating(accuracyValue),
            { color: accuracyColorMixer(accuracyValue).toString() }
        ];
    }, [accuracyColorMixer, liveData?.accuracy]);
    const energyStyle = useMemo(() => {
        const energyValue = liveData?.energy ?? 0;
        return { color: energyColorMixer(energyValue).toString() };
    }, [energyColorMixer, liveData?.energy]);
    const resetLocalState = useCallback(() => {
        dataPoints.current = [];
        startFromSeconds.current = null;
        setAccuracy(undefined);
        setEnergy(undefined);
    }, []);

    useEffect(() => {
        if (!liveData) {
            return;
        }
        setAccuracy(nf.format(liveData.accuracy / 100));
        setEnergy(liveData.energy);
        setGraphRange(100);

        if (!dataPoints.current) {
            return;
        } else if (liveData.seconds === 0) {
            // This is the first score update for the current map, assume we must clear the data points
            resetLocalState();
        }
        const dataPoint: DataPoint = liveData;
        if (startFromSeconds.current === null) {
            startFromSeconds.current = dataPoint.seconds;
        }
        dataPoints.current.push(dataPoint);
        if (graphCanvas.current && songLength) {
            drawGraphs(
                {
                    canvas: graphCanvas.current,
                    graphScale,
                    dataPoints: dataPoints.current,
                    songLengthSeconds: songLength,
                    startFromSeconds: startFromSeconds.current,
                    accuracyStyle: barGraphStyleFactory(accuracyColorMixer, dataPointToAccuracy, .5),
                    energyStyle: lineGraphStyleFactory(energyGradient, 2, .8),
                    missStyle: crossGraphStyleFactory({
                        getValue: dataPointToMisses,
                        color: '#ff0000',
                        alpha: 1,
                        border: {
                            color: '#ffffff',
                            alpha: 1,
                        },
                        lineWidth: 1,
                        size: 5
                    }),
                    setGraphRange
                },
            );
        }
    }, [accuracyColorMixer, liveData, nf, resetLocalState, songLength]);

    useEffect(() => {
        if (!reset) return;

        // Clear data points on song change
        resetLocalState();
    }, [reset, resetLocalState]);

    // Change graph width based on song length, between a sane minimum and maximum value
    const graphWidth = useMemo(() => songLength ? Math.max(200, Math.min(600, songLength * 2)) : 0, [songLength]);
    const graphStyle = useMemo(() => ({
        width: `${graphWidth}px`,
        height: `${graphHeight}px`
    }), [graphWidth]);

    return <>
        {graphWidth > 0 && (
            <div>
                <div id="accuracy-label">
                    {!!liveData?.misses &&
                        <span>{liveData.misses} Miss{liveData.misses !== 1 && 'es'}</span>}
                    <span><span className="fixed-width accuracy-percent">{accuracy}</span> Accuracy</span>
                    <span
                        style={accuracyStyle}
                        className="fixed-width accuracy-rating"
                    >{accuracyRating}</span>
                    {typeof energy === 'number' && (
                        <span className="energy" style={energyStyle}>
                            <span className="fixed-width energy-amount">{energy.toFixed(0)}</span>
                            <EnergyIcon />
                        </span>
                    )}
                </div>
                <div id="accuracy-graph-wrapper">
                    <span id="accuracy-graph-range" className="graph-legend-wrapper">
                        <span className="graph-legend top">100</span>
                        <span className="graph-legend bottom">{((1 - graphRange) * 100).toFixed(0)}</span>
                    </span>
                    <AccuracyGraphDurationLegend songLength={songLength} />
                    <canvas
                        style={graphStyle}
                        width={graphWidth * graphScale}
                        height={graphHeight * graphScale}
                        ref={graphCanvas}
                    />
                </div>
            </div>
        )}
        <AdditionalDataModifiers modifiers={modifiers} />
    </>;
};
