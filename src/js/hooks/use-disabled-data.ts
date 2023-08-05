import { DataDisplayProps } from '../beat-saber/DataDisplay';
import { useMemo } from 'react';
import { ReadyState } from 'react-use-websocket';

export const useDisabledData = (): DataDisplayProps =>
    useMemo(() => ({
        mapData: undefined,
        liveData: undefined,
        readyState: ReadyState.OPEN
    }), []);
