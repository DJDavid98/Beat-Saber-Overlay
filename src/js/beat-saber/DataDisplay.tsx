import { FC, useEffect, useRef, useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import { useObsControl } from '../hooks/use-obs-control';
import { SongInfo, SongInfoDisplayProps } from './SongInfo';
import { Connection } from './Connection';
import { AdditionalDataDisplay } from './AdditionalDataDisplay';
import { Modifiers } from '../model/modifiers';
import { LiveData } from '../model/live-data';
import { RemovableElement } from '../RemovableElement';
import { RemovableElementId } from '../model/removable-element-id';
import classNames from 'classnames';

export interface DataDisplayProps {
    mapData?: {
        inLevel: boolean;
        modifiers?: Modifiers;
        leftSaberColor?: string;
        rightSaberColor?: string;
    } & SongInfoDisplayProps;
    liveData?: LiveData;
    readyState: ReadyState;
}

export const DataDisplay: FC<DataDisplayProps> = ({ mapData, liveData, readyState }) => {
    const [reset, setReset] = useState(false);
    const lastInLevel = useRef<boolean | null>(null);
    const inLevel = mapData ? mapData.inLevel : false;
    const wsConnected = readyState === ReadyState.OPEN;
    const show = mapData?.inLevel || !wsConnected;
    const showAdditionalDataClass = show && wsConnected ? 'show' : undefined;

    useObsControl(readyState, mapData?.bsr);

    useEffect(() => {
        setReset(inLevel && !lastInLevel.current);
        if (lastInLevel.current === null) {
            lastInLevel.current = inLevel;
        }
    }, [inLevel]);

    return <>
        <div
            className={classNames('data-layout', {
                show,
                connected: Boolean(wsConnected && mapData)
            })}
        >
            {wsConnected && mapData
                ? <SongInfo {...mapData} />
                : <RemovableElement id={RemovableElementId.CONNECTION}>
                    <Connection readyState={readyState} />
                </RemovableElement>
            }
        </div>
        <RemovableElement
            id={RemovableElementId.BEAT_SABER_ADDITIONAL_DATA}
            className={showAdditionalDataClass}
        >
            <AdditionalDataDisplay
                modifiers={mapData?.modifiers}
                songLength={mapData?.duration}
                liveData={liveData}
                reset={reset}
            />
        </RemovableElement>
    </>;
};
