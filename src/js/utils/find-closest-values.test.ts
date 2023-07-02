import { findClosestValues } from './find-closest-values';
import { identityMapper } from './mappers';

describe('findClosestValues', () => {
    const mockValues = [1, 2, 3, 4, 5];

    it('should find an exact match', () => {
        expect(findClosestValues(mockValues, 3, identityMapper)).toEqual([3]);
    });

    it('should find the two closest matches', () => {
        expect(findClosestValues(mockValues, 3.5, identityMapper)).toEqual([3, 4]);
    });

    describe('negative cases', () => {
        it('should fail on values below the range', () => {
            expect(() => findClosestValues(mockValues, -1, identityMapper)).toThrowError();
        });

        it('should fail on values above the range', () => {
            expect(() => findClosestValues(mockValues, 6, identityMapper)).toThrowError();
        });
    });
});
