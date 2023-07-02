import { sortAscending } from './sort-ascending';
import { identityMapper } from './mappers';

describe('sortAscending', () => {
    it('should sort the provided array in ascending order', () => {
        expect(sortAscending([8, 0, 5, 6, 7, 1, 9, 2, 3, 4], identityMapper)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should work for single value', () => {
        expect(sortAscending([1], identityMapper)).toEqual([1]);
    });

    it('should work for empty array', () => {
        expect(sortAscending([], identityMapper)).toEqual([]);
    });
});
