import { dataPointToAccuracy, dataPointToEnergy } from './mappers';
import { LiveData } from '../model/live-data';
import { rescaleCanvasPositionY } from './graph-styles';
import { graphGridHorizontalStepsBase, widerTimestampsSecondsThreshold } from './constants';

export type DataPoint = Pick<LiveData, 'seconds' | 'accuracy' | 'energy' | 'misses'>;

export const defaultDataPoint: DataPoint = {
    seconds: 0,
    accuracy: 100,
    energy: 50,
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
};

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
    ctx.lineTo(positionX + halfSize, positionY - halfSize);
    ctx.stroke();
};

export const drawGrid = (
    ctx: CanvasRenderingContext2D,
    graphScale: number,
    canvasRightX: number,
    largestY: number,
    canvasBottomY: number,
    songLengthSeconds: number
) => {
    ctx.lineWidth = graphScale / 2;
    ctx.strokeStyle = '#ccc';

    // Draw horizontal grid lines
    const ratioY = largestY / canvasBottomY;
    const horizontalGridIncrement = canvasBottomY / (ratioY > .75 ? graphGridHorizontalStepsBase : graphGridHorizontalStepsBase * 2);
    for (let horizontalGridY = 0; horizontalGridY < canvasBottomY; horizontalGridY += horizontalGridIncrement) {
        if (horizontalGridY === 0) continue;
        const scaledY = rescaleCanvasPositionY(horizontalGridY, largestY, canvasBottomY);
        if (scaledY > canvasBottomY) break;
        ctx.beginPath();
        ctx.moveTo(0, scaledY);
        ctx.lineTo(canvasRightX, scaledY);
        ctx.stroke();
    }

    // Draw vertical grid lines
    const step = songLengthSeconds > widerTimestampsSecondsThreshold ? 0.25 : .5;
    const verticalGridIncrement = canvasRightX * step;
    for (let verticalGridX = 0; verticalGridX < canvasRightX; verticalGridX += verticalGridIncrement) {
        if (verticalGridX === 0) continue;
        ctx.beginPath();
        ctx.moveTo(verticalGridX, 0);
        ctx.lineTo(verticalGridX, canvasBottomY);
        ctx.stroke();
    }
};

export type PositionGetter = (dataPoint: DataPoint) => [number, number];

export type GraphStyle = (
    ctx: CanvasRenderingContext2D,
    graphScale: number,
    initialPosition: [number, number],
    largestY: number,
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
    setGraphRange: (range: number) => void;
}

export const drawGraphs = ({
    canvas,
    graphScale,
    dataPoints,
    songLengthSeconds,
    startFromSeconds,
    accuracyStyle,
    energyStyle,
    missStyle,
    setGraphRange
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

    let largestY = 0;
    let energyZeroX: number | null = null;
    const positionCache: Record<'accuracy' | 'energy', WeakMap<DataPoint, [number, number]>> = dataPoints.reduce((map,
        point) => {
        const accuracyPointPosition = getPointPosition(canvas, songLengthSeconds, point, dataPointToAccuracy);
        map.accuracy.set(point, accuracyPointPosition);
        const energyPointPosition = getPointPosition(canvas, songLengthSeconds, point, dataPointToEnergy);
        map.energy.set(point, energyPointPosition);
        const energyPositionY = energyPointPosition[1];
        const largestPointY = Math.max(accuracyPointPosition[1], energyPositionY);
        if (largestPointY > largestY) {
            largestY = largestPointY;
        }
        if (energyZeroX === null && energyPositionY === canvasBottomY) {
            energyZeroX = energyPointPosition[0];
        }
        return map;
    }, {
        accuracy: new WeakMap<DataPoint, [number, number]>(),
        energy: new WeakMap<DataPoint, [number, number]>(),
    });

    setGraphRange(largestY / canvasBottomY);
    drawGrid(ctx, graphScale, canvasRightX, largestY, canvasBottomY, songLengthSeconds);

    accuracyStyle(
        ctx,
        graphScale,
        initialPosition,
        largestY,
        canvasBottomY,
        dataPoints,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- YOLO
        dataPoint => positionCache.accuracy.get(dataPoint)!
    );

    energyStyle(
        ctx,
        graphScale,
        initialPosition,
        largestY,
        canvasBottomY,
        dataPoints,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- YOLO
        dataPoint => positionCache.energy.get(dataPoint)!
    );

    missStyle(
        ctx,
        graphScale,
        initialPosition,
        largestY,
        canvasBottomY,
        dataPoints,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- YOLO
        dataPoint => positionCache.energy.get(dataPoint)!
    );

    // Player died, color end of the graph as red
    if (energyZeroX !== null) {
        ctx.fillStyle = 'rgba(128,0,0,.25)';
        ctx.fillRect(energyZeroX, 0, canvasRightX, canvasBottomY);
    }
};
