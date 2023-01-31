import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";
import { ReadyState } from "react-use-websocket";
import { validateMapData } from "./utils/validate-map-data";
import { dataSource } from "./utils/constants";
import { Connection } from "./Connection";
import { failsafeWebsocketHookFactory } from "./utils/failsafe-websocket-hook-factory";
import { HeartRate } from "./HeartRate";
import { AdditionalDataDisplay } from "./AdditionalDataDisplay";
import { SongInfoDisplay } from "./SongInfoDisplay";

export const App: FunctionComponent = () => {
    const useFailsafeWebsocket = useMemo(() => failsafeWebsocketHookFactory(validateMapData), []);
    const {
        message: mapData,
        readyState
    } = useFailsafeWebsocket(`${dataSource}/MapData`, true);
    const pulsoidToken = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('pt');
    }, []);

    const [reset, setReset] = useState(false);
    const lastInLevel = useRef<boolean | null>(null);
    const inLevel = mapData ? mapData.InLevel : false;
    const wsConnected = readyState === ReadyState.OPEN;
    const showApp = mapData?.InLevel || !wsConnected;
    const showClass = showApp ? 'show' : undefined;

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
            <div id="additional-data" className={showClass}>
                <AdditionalDataDisplay modifiers={mapData?.Modifiers} songLength={mapData?.Duration} reset={reset} />
            </div>
        </div>
        {pulsoidToken && <HeartRate accessToken={pulsoidToken} />}
    </>;
}


