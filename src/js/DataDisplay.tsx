import { FC, useEffect, useRef, useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import { useObsControl } from './hooks/use-obs-control';
import { SongInfoDisplay, SongInfoDisplayProps } from './SongInfoDisplay';
import { Connection } from './Connection';
import { AdditionalDataDisplay } from './AdditionalDataDisplay';
import { Modifiers } from './model/modifiers';
import { LiveData } from './model/live-data';

export interface DataDisplayProps {
    mapData?: {
        inLevel: boolean;
        modifiers?: Modifiers;
    } & SongInfoDisplayProps;
    liveData?: LiveData;
    readyState: ReadyState;
}

export const DataDisplay: FC<DataDisplayProps> = ({ mapData, liveData, readyState }) => {
    const [reset, setReset] = useState(false);
    const lastInLevel = useRef<boolean | null>(null);
    const inLevel = mapData ? mapData.inLevel : false;
    const wsConnected = readyState === ReadyState.OPEN;
    const showApp = mapData?.inLevel || !wsConnected;
    const showClass = showApp ? 'show' : undefined;
    const showAdditionalDataClass = showApp && wsConnected ? 'show' : undefined;

    useObsControl(readyState, mapData?.bsr);

    useEffect(() => {
        setReset(inLevel && !lastInLevel.current);
        if (lastInLevel.current === null) {
            lastInLevel.current = inLevel;
        }
    }, [inLevel]);

    return <>
        <div id="data-layout" className={showClass}>
            {wsConnected && mapData
                ? <SongInfoDisplay {...mapData} />
                : <Connection readyState={readyState} />
            }
        </div>
        <div id="additional-data" className={showAdditionalDataClass}>
            <AdditionalDataDisplay
                modifiers={mapData?.modifiers}
                songLength={mapData?.duration}
                liveData={liveData}
                reset={reset}
            />
        </div>
    </>;
};
