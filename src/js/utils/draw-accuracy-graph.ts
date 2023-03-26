export interface DataPoint {
    seconds: number;
    accuracy: number;
}

interface Bounds {
    width: number;
    height: number;
}

/**
 * Data points that have a difference lower than this threshold will not be rendered on the graph
 */
export const SCORE_UPDATE_MAX_GRANULARITY = .2;

const getPointPosition = (
    canvas: Bounds,
    songLengthSeconds: number,
    startSeconds: number,
    dataPoint: DataPoint
): [number, number] => {
    const songProgressFloat = dataPoint.seconds / songLengthSeconds;
    const x: number = canvas.width * songProgressFloat;
    const accuracyFloat = dataPoint.accuracy / 100;
    const y: number = canvas.height * (1 - accuracyFloat);
    return [x, y];
}

export const drawStroke = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number,
    endY: number): void => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
};

export const drawRect = (ctx: CanvasRenderingContext2D, lastX: number, canvasBottomY: number, positionX: number,
    positionY: number): void => {
    const coords = [Math.floor(lastX), Math.floor(positionY), Math.ceil(positionX - lastX), Math.ceil(canvasBottomY - positionY)] as const;
    ctx.fillRect(...coords);
};

export type PositionGetter = (dataPont: DataPoint) => [number, number];

export type GraphStyle = (
    ctx: CanvasRenderingContext2D,
    initialPosition: [number, number],
    canvasBottomY: number,
    dataPoints: DataPoint[],
    getPosition: PositionGetter
) => void;

export const drawAccuracyGraph = (
    canvas: HTMLCanvasElement,
    dataPoints: DataPoint[],
    songLengthSeconds: number,
    startFromSeconds: number,
    style: GraphStyle
) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas rendering context');
        return;
    }
    const { width: canvasRightX, height: canvasBottomY } = canvas;
    ctx.clearRect(0, 0, canvasRightX, canvasBottomY);

    const initialPosition = getPointPosition(canvas, songLengthSeconds, 0, {
        seconds: startFromSeconds,
        accuracy: 0
    });

    const initialPositionX = initialPosition[0];
    if (initialPositionX > 0) {
        // Data does not start at 0, draw missing data filled in
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(0, 0, initialPositionX, canvasBottomY);
    }

    style(
        ctx,
        initialPosition,
        canvasBottomY,
        dataPoints,
        dataPoint => getPointPosition(canvas, songLengthSeconds, startFromSeconds, dataPoint)
    );
};
