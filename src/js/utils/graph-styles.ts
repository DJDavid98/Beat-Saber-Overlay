import { DataPoint, drawRect, GraphStyle, PositionGetter, SCORE_UPDATE_MAX_GRANULARITY } from "./draw-accuracy-graph";
import { WeightedColorMixer } from "./weighted-color-mix";

type DrawOnCanvasFunction = (
    positionX: number,
    positionY: number,
    lastX: number,
    dataPoint: DataPoint
) => void;

const drawPoints = (
    canvasBottomY: number,
    initialX: number,
    dataPoints: DataPoint[],
    getPosition: PositionGetter,
    drawOnCanvas: DrawOnCanvasFunction,
): number => {
    let lastX = initialX > 0 && dataPoints[0] ? getPosition(dataPoints[0])[0] : 0;
    dataPoints.forEach(dataPoint => {
        const position = getPosition(dataPoint);
        const [positionX, positionY] = position;
        const lastPosDeltaX = positionX - lastX;
        if (lastPosDeltaX < SCORE_UPDATE_MAX_GRANULARITY) {
            // Skip drawing lines between virtually identical X positions
            return;
        }
        drawOnCanvas(positionX, positionY, lastX, dataPoint);
        lastX = Math.ceil(positionX);
    });

    return lastX;
};


export const whiteFillGraphStyle: GraphStyle = (ctx, initialPosition, canvasBottomY, dataPoints, getPosition) => {
    ctx.lineWidth = 0;

    const [initialPositionX, initialPositionY] = initialPosition;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    // Move to initial X position at the bottom of the canvas
    ctx.moveTo(initialPositionX, canvasBottomY);
    // Draw line to actual initial position
    ctx.lineTo(initialPositionX, initialPositionY);

    // Draw line to each point in sequence
    const lastX = drawPoints(canvasBottomY, initialPosition[0], dataPoints, getPosition, (positionX, positionY) => {
        ctx.lineTo(positionX, positionY);
    })

    // Draw final line from lastX to bottom of canvas and close path
    ctx.lineTo(lastX, canvasBottomY);
    ctx.closePath();

    ctx.fill();
};

export const whiteSpikesGraphStyle: GraphStyle = (ctx, initialPosition, canvasBottomY, dataPoints, getPosition) => {
    ctx.fillStyle = '#fff';

    // Draw rectangle for each point in sequence
    drawPoints(canvasBottomY, initialPosition[0], dataPoints, getPosition, (positionX, positionY, lastX) => {
        drawRect(ctx, lastX, canvasBottomY, positionX, positionY);
    })
};

export const accuracyColorGraphStyleFactory: (mixer: WeightedColorMixer) => GraphStyle = (mixer) =>
    (ctx, initialPosition, canvasBottomY, dataPoints, getPosition) => {
        // Draw rectangle for each point in sequence
        drawPoints(canvasBottomY, initialPosition[0], dataPoints, getPosition, (positionX, positionY, lastX,
            dataPoint) => {
            ctx.fillStyle = mixer(dataPoint.accuracy);
            drawRect(ctx, lastX, canvasBottomY, positionX, positionY);
        });
    };
