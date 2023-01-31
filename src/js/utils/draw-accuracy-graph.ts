export interface DataPoint {
    seconds: number;
    accuracy: number;
}

interface Bounds {
    width: number;
    height: number;
}

const pointPosition = (canvas: Bounds, songLengthSeconds: number, startSeconds: number,
    dataPoint: DataPoint): [number, number] => {
    const songProgressFloat = dataPoint.seconds / songLengthSeconds;
    const x: number = canvas.width * songProgressFloat;
    const accuracyFloat = dataPoint.accuracy / 100;
    const y: number = canvas.height * (1 - accuracyFloat);
    return [x, y];
}

export const drawAccuracyGraph = (canvas: HTMLCanvasElement, dataPoints: DataPoint[], songLengthSeconds: number,
    startFromSeconds: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas rendering context');
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 0;

    const initialPosition = pointPosition(canvas, songLengthSeconds, 0, { seconds: startFromSeconds, accuracy: 0 });

    // Data does not start at 0, draw missing data filled in
    if (initialPosition[0] > 1) {
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(0, 0, initialPosition[0], canvas.height);
    }

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    // Move to initial position
    ctx.moveTo(initialPosition[0], canvas.height);
    // Draw line to initial position
    ctx.lineTo(...initialPosition);

    // Draw each point in sequence
    let lastX: number = 0;
    dataPoints.forEach(dataPoint => {
        const position = pointPosition(canvas, songLengthSeconds, startFromSeconds, dataPoint);
        // Do not draw lines between virtually identical X positions
        if (position[0] - lastX > 0.5) {
            ctx.lineTo(...position);
            lastX = position[0];
        }
    });

    // Draw final line from lastX to bottom fo canvas and close path
    ctx.lineTo(lastX, canvas.height);
    ctx.closePath();

    ctx.fill();
};
