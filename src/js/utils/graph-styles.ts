import {
    DataPoint,
    drawRect,
    GraphStyle,
    PositionGetter,
    SCORE_UPDATE_MAX_GRANULARITY,
    ValueGetter
} from "./draw-graphs";
import { WeightedColorMixer } from "./weighted-color-mix";
import { GradientStop } from "../class/gradient-stop.class";
import { getCanvasLinearGradient } from "./colors";

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


export const lineGraphStyleFactory = (strokeGradient: GradientStop[], lineWidth: number,
    alpha: number): GraphStyle =>
    (ctx, initialPosition, canvasBottomY, dataPoints, getPosition) => {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = getCanvasLinearGradient(ctx, strokeGradient, alpha);
        ctx.beginPath();

        // Move to initial position
        const [initialPositionX, initialPositionY] = initialPosition;
        ctx.moveTo(initialPositionX, initialPositionY);


        // Create line to each point in sequence
        drawPoints(canvasBottomY, initialPosition[0], dataPoints, getPosition, (positionX, positionY) => {
            ctx.lineTo(positionX, positionY);
        });

        // Draw line
        ctx.stroke();
    };

export const barGraphStyleFactory = (
    mixer: WeightedColorMixer,
    getColorValue: ValueGetter,
    alpha: number
): GraphStyle =>
    (ctx, initialPosition, canvasBottomY, dataPoints, getPosition) => {
        // Draw rectangle for each point in sequence
        drawPoints(canvasBottomY, initialPosition[0], dataPoints, getPosition, (positionX, positionY, lastX,
            dataPoint) => {
            ctx.fillStyle = mixer(getColorValue(dataPoint)).toString(alpha);
            drawRect(ctx, lastX, canvasBottomY, positionX, positionY);
        });
    };
