export interface DataPoint {
    seconds: number;
    accuracy: number;
}

interface Bounds {
    width: number;
    height: number;
}

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

export const drawAccuracyGraph = (
    canvas: HTMLCanvasElement,
    dataPoints: DataPoint[],
    songLengthSeconds: number,
    startFromSeconds: number
) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas rendering context');
        return;
    }
    const { width: canvasRightX, height: canvasBottomY } = canvas;
    ctx.clearRect(0, 0, canvasRightX, canvasBottomY);
    ctx.lineWidth = 0;

    const [initialPositionX, initialPositionY] = getPointPosition(canvas, songLengthSeconds, 0, {
        seconds: startFromSeconds,
        accuracy: 0
    });

    if (initialPositionX > 1) {
        // Data does not start at 0, draw missing data filled in
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(0, 0, initialPositionX, canvasBottomY);
    }

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    // Move to initial X position at the bottom of the canvas
    ctx.moveTo(initialPositionX, canvasBottomY);
    // Draw line to actual initial position
    ctx.lineTo(initialPositionX, initialPositionY);

    // Draw line to each point in sequence
    let lastX = 0;
    dataPoints.forEach(dataPoint => {
        const position = getPointPosition(canvas, songLengthSeconds, startFromSeconds, dataPoint);
        if (position[0] - lastX < 0.5) {
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
