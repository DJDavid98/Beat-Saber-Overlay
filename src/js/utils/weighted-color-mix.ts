import { GradientStop } from "../class/gradient-stop.class";
import { findClosestValues } from "./find-closest-values";
import { sortAscending } from "./sort-ascending";
import { gradientStopPositionMapper } from "./mappers";

/**
 * Function which can be used to calculate the CSS color in the gradient at the given position value.
 *
 * @param value Ranges from 0-100 (integer).
 */
export type WeightedColorMixer = (value: number) => GradientStop;

/**
 * Takes a set of gradient stops and returns a weighted color mixer function
 */
export const weightedColorMixerFactory = (gradient: GradientStop[], smooth = true): WeightedColorMixer => {
    const sortedGradient = sortAscending(gradient, gradientStopPositionMapper);

    return (value) => {
        const stop = findClosestValues(sortedGradient, value, gradientStopPositionMapper);
        return stop.length === 1 ? stop[0] : GradientStop.mix(stop, value, smooth);
    };
};
