import { FunctionComponent, useMemo } from "react";
import { CoverImage } from "./CoverImage";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { validateMapData } from "./validators";
import { dataSource, defaultCoverImage } from "./constants";
import { SongName } from "./SongName";
import { SongAuthor } from "./SongAuthor";
import { SongDetails } from "./SongDetails";
import { Connection } from "./Connection";

export const App: FunctionComponent = () => {
    const { lastJsonMessage: rawMapData, readyState } = useWebSocket(`${dataSource}/MapData`, {
        reconnectAttempts: Infinity,
        retryOnError: true,
        reconnectInterval: 1e3,
        onReconnectStop: () => {
            window.location.reload();
        }
    });

    const mapData = useMemo(() => validateMapData(rawMapData), [rawMapData]);

    const wsConnected = readyState === ReadyState.OPEN;

    return <div id="app" className={mapData && mapData.InLevel || !wsConnected ? 'show' : undefined}>
        {wsConnected && mapData
            ? <>
                <div id="map-data">
                    <SongName name={mapData.SongName} subName={mapData.SongSubName} />
                    <SongAuthor author={mapData.SongAuthor} mapper={mapData.Mapper} />
                    <SongDetails
                        difficulty={mapData.Difficulty}
                        bsr={mapData.BSRKey}
                        star={mapData.Star}
                        duration={mapData.Duration}
                        pp={mapData.PP}
                    />
                </div>
                <CoverImage url={mapData.CoverImage || defaultCoverImage} />
            </>
            : <Connection readyState={readyState} />
        }
    </div>;
}


