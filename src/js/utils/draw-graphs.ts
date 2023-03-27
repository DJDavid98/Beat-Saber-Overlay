import { dataPointToAccuracy, dataPointToEnergy } from "./mappers";
import { LiveData } from "../model/live-data";

export type DataPoint = Pick<LiveData, 'seconds' | 'accuracy' | 'energy'>;

export const defaultDataPoint: DataPoint = {
    seconds: 0,
    accuracy: 100,
    energy: 100,
};

interface Bounds {
    width: number;
    height: number;
}

/**
 * Data points that have a difference lower than this threshold will not be rendered on the graph
 */
export const SCORE_UPDATE_MAX_GRANULARITY = .2;

/**
 * @return 0-100
 */
export type ValueGetter = (dataPoint: DataPoint) => number;

const getPointPosition = (
    canvas: Bounds,
    songLengthSeconds: number,
    dataPoint: DataPoint,
    getValue?: ValueGetter
): [number, number] => {
    const songProgressFloat = dataPoint.seconds / songLengthSeconds;
    const x: number = canvas.width * songProgressFloat;
    const valueFloat = getValue ? getValue(dataPoint) / 100 : 100;
    const y: number = canvas.height * (1 - valueFloat);
    return [x, y];
}

export const drawRect = (ctx: CanvasRenderingContext2D, lastX: number, canvasBottomY: number, positionX: number,
    positionY: number): void => {
    const coords = [Math.floor(lastX), Math.floor(positionY), Math.ceil(positionX - lastX), Math.ceil(canvasBottomY - positionY)] as const;
    ctx.fillRect(...coords);
};

export type PositionGetter = (dataPoint: DataPoint) => [number, number];

export type GraphStyle = (
    ctx: CanvasRenderingContext2D,
    initialPosition: [number, number],
    canvasBottomY: number,
    dataPoints: DataPoint[],
    getPosition: PositionGetter
) => void;

export const drawGraphs = (
    canvas: HTMLCanvasElement,
    dataPoints: DataPoint[],
    songLengthSeconds: number,
    startFromSeconds: number,
    accuracyStyle: GraphStyle,
    energyStyle: GraphStyle
) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas rendering context');
        return;
    }
    const { width: canvasRightX, height: canvasBottomY } = canvas;
    ctx.clearRect(0, 0, canvasRightX, canvasBottomY);

    const initialPosition = getPointPosition(canvas, songLengthSeconds, {
        ...defaultDataPoint,
        seconds: startFromSeconds,
    });

    const initialPositionX = initialPosition[0];
    if (initialPositionX > 0) {
        // Data does not start at 0, draw missing data filled in
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(0, 0, initialPositionX, canvasBottomY);
    }

    accuracyStyle(
        ctx,
        initialPosition,
        canvasBottomY,
        dataPoints,
        dataPoint => getPointPosition(canvas, songLengthSeconds, dataPoint, dataPointToAccuracy)
    );

    energyStyle(
        ctx,
        initialPosition,
        canvasBottomY,
        dataPoints,
        dataPoint => getPointPosition(canvas, songLengthSeconds, dataPoint, dataPointToEnergy)
    );
};
