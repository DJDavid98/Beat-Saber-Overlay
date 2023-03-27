import { dataPointToAccuracy, dataPointToEnergy } from "./mappers";
import { LiveData } from "../model/live-data";

export type DataPoint = Pick<LiveData, 'seconds' | 'accuracy' | 'energy' | 'misses'>;

export const defaultDataPoint: DataPoint = {
    seconds: 0,
    accuracy: 100,
    energy: 100,
    misses: 0,
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

export const drawRect = (
    ctx: CanvasRenderingContext2D,
    lastX: number,
    canvasBottomY: number,
    positionX: number,
    positionY: number
): void => {
    const coords = [Math.floor(lastX), Math.floor(positionY), Math.ceil(positionX - lastX), Math.ceil(canvasBottomY - positionY)] as const;
    ctx.fillRect(...coords);
};

export const drawCross = (ctx: CanvasRenderingContext2D, positionX: number, positionY: number, size: number): void => {
    const halfSize = size / 2;

    ctx.beginPath();
    // Move to top left line start
    ctx.moveTo(positionX - halfSize, positionY - halfSize);
    // Line to bottom right
    ctx.lineTo(positionX + halfSize, positionY + halfSize);
    // Move to bottom left line start
    ctx.moveTo(positionX - halfSize, positionY + halfSize);
    // Line to top right
    ctx.lineTo(positionX + halfSize, positionY - halfSize)
    ctx.stroke();
};

export type PositionGetter = (dataPoint: DataPoint) => [number, number];

export type GraphStyle = (
    ctx: CanvasRenderingContext2D,
    graphScale: number,
    initialPosition: [number, number],
    canvasBottomY: number,
    dataPoints: DataPoint[],
    getPosition: PositionGetter
) => void;

interface DrawGraphsParams {
    canvas: HTMLCanvasElement;
    graphScale: number;
    dataPoints: DataPoint[];
    songLengthSeconds: number;
    startFromSeconds: number;
    accuracyStyle: GraphStyle;
    energyStyle: GraphStyle;
    missStyle: GraphStyle;
}

export const drawGraphs = ({
    canvas,
    graphScale,
    dataPoints,
    songLengthSeconds,
    startFromSeconds,
    accuracyStyle,
    energyStyle,
    missStyle
}: DrawGraphsParams) => {
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
        graphScale,
        initialPosition,
        canvasBottomY,
        dataPoints,
        dataPoint => getPointPosition(canvas, songLengthSeconds, dataPoint, dataPointToAccuracy)
    );

    energyStyle(
        ctx,
        graphScale,
        initialPosition,
        canvasBottomY,
        dataPoints,
        dataPoint => getPointPosition(canvas, songLengthSeconds, dataPoint, dataPointToEnergy)
    );

    missStyle(
        ctx,
        graphScale,
        initialPosition,
        canvasBottomY,
        dataPoints,
        dataPoint => getPointPosition(canvas, songLengthSeconds, dataPoint, dataPointToEnergy)
    );
};
