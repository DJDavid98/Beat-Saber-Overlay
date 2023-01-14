import { FunctionComponent, useMemo } from "react";
import { CoverImage } from "./CoverImage";
import { ReadyState } from "react-use-websocket";
import { validateMapData } from "./utils/validate-map-data";
import { dataSource, defaultCoverImage } from "./utils/constants";
import { SongName } from "./SongName";
import { SongAuthor } from "./SongAuthor";
import { SongDetails } from "./SongDetails";
import { Connection } from "./Connection";
import { useFailsafeWebsocket } from "./utils/use-failsafe-websocket";
import { HeartRate } from "./HeartRate";

export const App: FunctionComponent = () => {
    const { message: mapData, readyState } = useFailsafeWebsocket(`${dataSource}/MapData`, validateMapData);
    const pulsoidToken = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('pt');
    }, []);

    const wsConnected = readyState === ReadyState.OPEN;

    return <>
        <div id="app" className={mapData && mapData.InLevel || !wsConnected ? 'show' : undefined}>
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
        </div>
        {pulsoidToken && <HeartRate accessToken={pulsoidToken} />}
    </>;
}


