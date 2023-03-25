/**
 * Takes two arguments: the array to sort and a mapping function that maps the elements of the array to numeric values.
 *
 * The function returns a new array that contains the same elements, but sorted in ascending order based on their mapped values.
 */
export const sortAscending = <T>(arr: T[], mapValue: (value: T) => number): T[] =>
    arr.sort((a, b) => mapValue(a) - mapValue(b));
