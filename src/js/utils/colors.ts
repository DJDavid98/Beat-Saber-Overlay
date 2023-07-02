import { GradientStop } from '../class/gradient-stop.class';

export type RGBArray = [number, number, number];
export type RGBAlphaArray = [number, number, number, number];

export function hexToRgb(hex: number, alpha?: undefined): RGBArray
export function hexToRgb(hex: number, alpha: number): RGBAlphaArray
export function hexToRgb(hex: number, alpha?: number): RGBArray | RGBAlphaArray {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;

    if (alpha) return [r, g, b, alpha];
    return [r, g, b];
}

export const rgbToHex = ([r, g, b]: RGBArray): number => {
    return (r << 16) | (g << 8) | b;
};

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
};

export const getCanvasLinearGradient = (
    ctx: CanvasRenderingContext2D,
    stops: GradientStop[],
    alpha?: number,
    heightMultiplier = 1
): CanvasGradient => {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height * heightMultiplier);
    stops.forEach(stop => {
        gradient.addColorStop(1 - (stop.position / 100), stop.toString(alpha));
    });

    return gradient;
};
