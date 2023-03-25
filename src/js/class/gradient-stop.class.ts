import { sortAscending } from "../utils/sort-ascending";
import { hexToRgb, RGBArray, rgbToHex, getGradientStopWeights } from "../utils/colors";

export class GradientStop {
    public readonly value: number;

    /**
     * @param hex HEX string or numeric value
     * @param position 0-100
     */
    constructor(hex: string | number, public readonly position: number) {
        this.value = typeof hex === 'string' ? parseInt(hex.replace(/[^a-f\d]/g, ''), 16) : hex;
    }

    toString() {
        const colorString = '00000' + (this.value.toString(16));
        const start = colorString.length - 6;
        return '#' + (colorString).substring(start, colorString.length);
    }

    /**
     * Mix the current and provided gradient stops based on the provided position
     * @param stops
     * @param position 0-100
     */
    static mix(stops: [GradientStop, GradientStop], position: number): GradientStop {
        const [earlierStop, laterStop] = sortAscending(stops, stop => stop.position);
        const [earlierStopWeight, laterStopWeight] = getGradientStopWeights(earlierStop.position, laterStop.position, position);

        const earlierStopRgb = hexToRgb(earlierStop.value);
        const laterStopRgb = hexToRgb(laterStop.value);
        const newValue = rgbToHex(earlierStopRgb.map((n, i) => {
                const earlierStopComponent = n * earlierStopWeight;
                const laterStopComponent = laterStopRgb[i] * laterStopWeight;
                // Weighted average of the two components
                return Math.round(earlierStopComponent + laterStopComponent);
            }
        ) as RGBArray);
        return new GradientStop(newValue, position);
    }
}
