import { GradientStop } from "../class/gradient-stop.class";
import { findClosestValues } from "./find-closest-values";

export const identityMapper = <T>(value: T): T => value;

export const gradientStopPositionMapper = (input: GradientStop): number => input.position;

export const timeToMockAccuracy = (t: number, tMax: number, min: number, max: number): number =>
    min + (max - min) * (0.5 + (Math.cos(Math.PI * (t / tMax) * 2) / 2));

export const mapDifficulty = (difficulty?: string) => difficulty === 'ExpertPlus' ? 'Expert+' : difficulty;

const enum AccuracyRating {
    E = 'E',
    D = 'D',
    C = 'C',
    B = 'B',
    A = 'A',
    S = 'S',
    SS = 'SS',
    SSS = 'SSS',
}

/**
 * Numbers represent lower end of the accuracy score interval, inclusive
 *
 * @see https://bsaber.com/indepth-guide/
 */
const accuracyValues: Array<[number, AccuracyRating]> = [
    [0, AccuracyRating.E],
    [20, AccuracyRating.D],
    [35, AccuracyRating.C],
    [50, AccuracyRating.B],
    [65, AccuracyRating.A],
    [80, AccuracyRating.S],
    [90, AccuracyRating.SS],
    [100, AccuracyRating.SSS]
];

export const mapAccuracyRating = (value: number): AccuracyRating =>
    findClosestValues(accuracyValues, value, (accuracyValue) => accuracyValue[0])[0][1];
