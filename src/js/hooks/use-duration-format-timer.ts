import { useMemo } from 'react';
import DurationUnitFormat from 'intl-unofficial-duration-unit-format';

export const useDurationFormatTimer = () => useMemo(() => new DurationUnitFormat('en-US', {
    style: 'timer',
}), []);
