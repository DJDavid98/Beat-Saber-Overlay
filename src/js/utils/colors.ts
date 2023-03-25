export type RGBArray = [number, number, number];

export const hexToRgb = (hex: number): RGBArray => {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;

    return [r, g, b];
}

export const rgbToHex = ([r, g, b]: RGBArray): number => {
    return (r << 16) | (g << 8) | b;
}

export const getGradientStopWeights = (
    earlierStopPosition: number,
    laterStopPosition: number,
    position: number
): [number, number] => {
    if (earlierStopPosition > laterStopPosition) {
        throw new RangeError('Earlier stop cannot be greater than later stop');
    }
    if (position < earlierStopPosition) {
        throw new RangeError('Position cannot be less than earlier stop');
    }
    if (position > laterStopPosition) {
        throw new RangeError('Position cannot be greater than later stop');
    }

    const laterStopWeight = ((position - earlierStopPosition) / (laterStopPosition - earlierStopPosition));
    const earlierStopWeight = 1 - laterStopWeight;

    return [earlierStopWeight, laterStopWeight];
}
