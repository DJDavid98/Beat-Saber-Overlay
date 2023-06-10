import {
    DataPoint, drawCross,
    drawRect,
    GraphStyle,
    PositionGetter,
    SCORE_UPDATE_MAX_GRANULARITY,
    ValueGetter
} from "./draw-graphs";
import { WeightedColorMixer } from "./weighted-color-mix";
import { GradientStop, HexColorString } from "../class/gradient-stop.class";
import { getCanvasLinearGradient } from "./colors";

type DrawOnCanvasFunction = (
    positionX: number,
    positionY: number,
    lastX: number,
    dataPoint: DataPoint
) => void;

export const rescaleCanvasPositionY = (targetY: number, largestY: number, canvasBottomY: number) =>
    (targetY / largestY) * canvasBottomY;

interface DrawPointsParams {
    initialX: number;
    dataPoints: DataPoint[];
    getPosition: PositionGetter;
    drawOnCanvas: DrawOnCanvasFunction;
}

const drawPoints = (
    { initialX, dataPoints, getPosition, drawOnCanvas }: DrawPointsParams,
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


export const lineGraphStyleFactory = (
    strokeGradient: GradientStop[],
    lineWidth: number,
    alpha: number
): GraphStyle =>
    (ctx, scale, initialPosition, largestY, canvasBottomY, dataPoints, getPosition) => {
        ctx.lineWidth = lineWidth * scale;
        const gradientCanvasHeightMultiplier = 1 + (1 - (largestY / canvasBottomY));
        ctx.strokeStyle = getCanvasLinearGradient(ctx, strokeGradient, alpha, gradientCanvasHeightMultiplier);

        // Move to initial position
        const [initialPositionX, initialPositionY] = initialPosition;
        ctx.moveTo(initialPositionX, initialPositionY);
        ctx.beginPath();

        // Create line to each point in sequence
        drawPoints({
            initialX: initialPosition[0],
            dataPoints,
            getPosition,
            drawOnCanvas: (positionX, positionY) => {
                const scaledY = rescaleCanvasPositionY(positionY, largestY, canvasBottomY);
                ctx.lineTo(positionX, scaledY);
            }
        });

        // Draw line
        ctx.stroke();
    };

export const barGraphStyleFactory = (
    mixer: WeightedColorMixer,
    getColorValue: ValueGetter,
    alpha: number
): GraphStyle =>
    (ctx, scale, initialPosition, largestY, canvasBottomY, dataPoints, getPosition) => {
        // Draw rectangle for each point in sequence
        drawPoints({
            initialX: initialPosition[0],
            dataPoints,
            getPosition,
            drawOnCanvas: (positionX, positionY, lastX, dataPoint) => {
                ctx.fillStyle = mixer(getColorValue(dataPoint)).toString(alpha);
                const scaledY = rescaleCanvasPositionY(positionY, largestY, canvasBottomY);
                drawRect(ctx, lastX, canvasBottomY, positionX, scaledY);
            }
        });
    };

interface CrossGraphStyleFactoryParams {
    getValue: ValueGetter;
    color: HexColorString;
    alpha: number;
    border?: {
        color: HexColorString;
        alpha: number;
    };
    lineWidth: number;
    size: number;
}

export const crossGraphStyleFactory = ({
    getValue,
    color,
    alpha,
    border,
    lineWidth,
    size
}: CrossGraphStyleFactoryParams): GraphStyle =>
    (ctx, scale, initialPosition, largestY, canvasBottomY, dataPoints, getPosition) => {
        const scaledSize = size * scale;
        const baseStyle = new GradientStop(color, 0).toString(alpha);
        const borderStyle = border ? new GradientStop(border.color, 0).toString(border.alpha) : null;
        const baseLineWidth = lineWidth * scale;

        // Draw cross for each non-zero point in sequence
        let lastValue = 0;
        drawPoints({
            initialX: initialPosition[0],
            dataPoints,
            getPosition,
            drawOnCanvas: (positionX, positionY, lastX, dataPoint) => {
                const value = getValue(dataPoint);
                if (lastValue === value || value === 0) {
                    return;
                }
                const scaledY = rescaleCanvasPositionY(positionY, largestY, canvasBottomY);
                if (borderStyle) {
                    // Draw border
                    ctx.strokeStyle = borderStyle;
                    ctx.lineWidth = baseLineWidth * 3;
                    drawCross(ctx, positionX, scaledY, scaledSize * 1.25);
                }
                // Draw base cross
                ctx.strokeStyle = baseStyle;
                ctx.lineWidth = baseLineWidth;
                drawCross(ctx, positionX, scaledY, scaledSize);
                lastValue = value;
            }
        });
    };
