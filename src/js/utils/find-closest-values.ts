/**
 * This implementation takes an array of values of generic type T, a value of type T to search for, and a function
 * that maps a value of type T to a number. The binary search algorithm is used to find the index of the value in
 * the array or the index where the value would be inserted if it is not present in the array.
 *
 * The mapValue function is used to convert the value to a number type wherever the value is used in the function.
 *
 * If the value is found in the array, it returns the exact match. Otherwise, it calculates the differences between
 * the mapped value and the nearest values in the array (one value to the left and one value to the right) using
 * the mapValue function. It returns a tuple containing the two nearest values.
 */
export function findClosestValues<T>(
    arr: T[],
    value: number,
    mapValue: (val: T) => number
): [T, T] | [T] {
    const firstValue = mapValue(arr[0]);
    if (value < firstValue) {
        throw new RangeError('Value is less than first array item');
    }
    const lastValue = mapValue(arr[arr.length - 1]);
    if (value > lastValue) {
        throw new RangeError('Value is greater than last array item');
    }

    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (mapValue(arr[mid]) === value) {
            return [arr[mid]];
        } else if (mapValue(arr[mid]) < value) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    if (right < 0) {
        return [arr[left], arr[left + 1]];
    }

    if (left >= arr.length) {
        return [arr[right - 1], arr[right]];
    }

    const diff1 = value - mapValue(arr[right]);
    const diff2 = mapValue(arr[left]) - value;

    if (diff1 <= diff2) {
        return [arr[right], arr[right + 1]];
    } else {
        return [arr[left - 1], arr[left]];
    }
}
