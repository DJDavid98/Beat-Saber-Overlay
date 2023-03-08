import { FunctionComponent, useEffect, useRef, useState } from "react";
import { ReadyState } from "react-use-websocket";
import { validateMapData } from "./utils/validate-map-data";
import { dataSource } from "./utils/constants";
import { Connection } from "./Connection";
import { useFailsafeWebsocket } from "./utils/use-failsafe-websocket";
import { AdditionalDataDisplay } from "./AdditionalDataDisplay";
import { SongInfoDisplay } from "./SongInfoDisplay";
import { useObsControl } from "./utils/use-obs-control";

export const App: FunctionComponent = () => {
    const {
        message: mapData,
        readyState
    } = useFailsafeWebsocket(`${dataSource}/MapData`, validateMapData, true);

    const [reset, setReset] = useState(false);
    const lastInLevel = useRef<boolean | null>(null);
    const inLevel = mapData ? mapData.InLevel : false;
    const wsConnected = readyState === ReadyState.OPEN;
    const showApp = mapData?.InLevel || !wsConnected;
    const showClass = showApp ? 'show' : undefined;
    const showAdditionalDataClass = showApp && wsConnected ? 'show' : undefined;

    useObsControl(readyState, mapData?.LevelFinished, mapData?.BSRKey);

    useEffect(() => {
        setReset(inLevel && !lastInLevel.current);
        if (lastInLevel.current === null) {
            lastInLevel.current = inLevel;
        }
    }, [inLevel]);

    return <>
        <div id="app">
            <div id="data-layout" className={showClass}>
                {wsConnected && mapData
                    ? <SongInfoDisplay mapData={mapData} />
                    : <Connection readyState={readyState} />
                }
            </div>
            <div id="additional-data" className={showAdditionalDataClass}>
                <AdditionalDataDisplay
                    modifiers={mapData?.Modifiers}
                    songLength={mapData?.Duration}
                    reset={reset}
                />
            </div>
        </div>
    </>;
}


