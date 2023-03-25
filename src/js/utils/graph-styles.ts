import { drawStroke, GraphStyle, SCORE_UPDATE_MAX_GRANULARITY } from "./draw-accuracy-graph";
import { WeightedColorMixer } from "./weighted-color-mix";

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
    let lastX = 0;
    dataPoints.forEach(dataPoint => {
        const position = getPosition(dataPoint);
        if (position[0] - lastX < SCORE_UPDATE_MAX_GRANULARITY) {
            // Skip drawing lines between virtually identical X positions
            return;
        }
        ctx.lineTo(...position);
        lastX = position[0];
    });

    // Draw final line from lastX to bottom of canvas and close path
    ctx.lineTo(lastX, canvasBottomY);
    ctx.closePath();

    ctx.fill();
};

export const whiteSpikesGraphStyle: GraphStyle = (ctx, initialPosition, canvasBottomY, dataPoints, getPosition) => {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fff';

    // Draw stroke for each point in sequence
    let lastX = 0;
    dataPoints.forEach(dataPoint => {
        const position = getPosition(dataPoint);
        const [positionX, positionY] = position;
        if (positionX - lastX < SCORE_UPDATE_MAX_GRANULARITY) {
            // Skip drawing lines between virtually identical X positions
            return;
        }
        drawStroke(ctx, positionX, canvasBottomY, positionX, positionY);
        lastX = positionX;
    });
};

export const accuracyColorGraphStyleFactory: (mixer: WeightedColorMixer) => GraphStyle = (mixer) => (ctx,
    initialPosition, canvasBottomY, dataPoints, getPosition) => {
    ctx.lineWidth = 1.5;

    // Draw stroke for each point in sequence
    let lastX = 0;
    dataPoints.forEach(dataPoint => {
        const position = getPosition(dataPoint);
        const [positionX, positionY] = position;
        if (positionX - lastX < SCORE_UPDATE_MAX_GRANULARITY) {
            // Skip drawing lines between virtually identical X positions
            return;
        }
        ctx.strokeStyle = mixer(dataPoint.accuracy);
        drawStroke(ctx, positionX, canvasBottomY, positionX, positionY);
        lastX = positionX;
    });
};
