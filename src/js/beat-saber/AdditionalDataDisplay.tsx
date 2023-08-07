import { FC } from 'react';
import { AdditionalDataModifiers } from './AdditionalDataModifiers';
import { Modifiers } from '../model/modifiers';
import { LiveData } from '../model/live-data';
import { RemovableElement } from '../RemovableElement';
import { RemovableElementId } from '../model/removable-element-id';
import { AdditionalDataAccuracyGraph } from './AdditionalDataAccuracyGraph';

export interface AdditionalDataDisplayProps {
    modifiers?: Modifiers;
    songLength?: number;
    liveData?: LiveData;
    /**
     * Signal boolean which is flipped each time the additional data component should reset its internal state
     */
    reset?: boolean;
}

export const AdditionalDataDisplay: FC<AdditionalDataDisplayProps> = ({
    modifiers,
    songLength,
    liveData,
    reset
}) => {
    return <>
        <RemovableElement id={RemovableElementId.BEAT_SABER_ACCURACY_GRAPH}>
            <AdditionalDataAccuracyGraph
                liveData={liveData}
                reset={reset}
                songLength={songLength}
            />
        </RemovableElement>
        <RemovableElement id={RemovableElementId.BEAT_SABER_MODIFIERS}>
            <AdditionalDataModifiers modifiers={modifiers} />
        </RemovableElement>
    </>;
};
