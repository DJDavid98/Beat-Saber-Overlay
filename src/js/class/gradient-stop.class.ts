import { sortAscending } from '../utils/sort-ascending';
import { getGradientStopWeights, hexToRgb, RGBArray, rgbToHex } from '../utils/colors';

export type HexColorString = `#${string}`;

export class GradientStop {
    public readonly value: number;

    /**
     * @param hex HEX string or numeric value
     * @param position 0-100
     */
    constructor(hex: HexColorString | number, public readonly position: number) {
        this.value = typeof hex === 'number' ? hex : parseInt(hex.replace(/[^a-f\d]/g, ''), 16);
    }

    toString(alpha?: number) {
        if (alpha) {
            return `rgba(${hexToRgb(this.value, alpha).join(',')})`;
        }

        const colorString = '00000' + (this.value.toString(16));
        const start = colorString.length - 6;
        return '#' + (colorString).substring(start, colorString.length);
    }

    /**
     * Mix the current and provided gradient stops based on the provided position
     * @param stops
     * @param position 0-100
     * @param smooth if `true`, return the weighted average of the two colors, otherwise return the closest color
     */
    static mix(stops: [GradientStop, GradientStop], position: number, smooth: boolean): GradientStop {
        const [earlierStop, laterStop] = sortAscending(stops, stop => stop.position);

        if (!smooth) {
            return earlierStop;
        }

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
