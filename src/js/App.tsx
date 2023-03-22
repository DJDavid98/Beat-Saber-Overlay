import { FunctionComponent } from "react";
import { DataDisplay } from "./DataDisplay";
import { useBsdpData } from "./hooks/use-bsdp-data";
import { useBsPlusData } from "./hooks/use-bs-plus-data";

export interface AppProps {
    /**
     * When `true` the BeatSaberPlus SongOverlay data source will be used
     */
    bsPlus: boolean;
}

export const App: FunctionComponent<AppProps> = ({ bsPlus }) => {
    const bsdpDataSource = useBsdpData(!bsPlus);
    const bsPlusDataSource = useBsPlusData(bsPlus);

    return (
        <div id="app">
            <DataDisplay {...(bsPlus ? bsPlusDataSource : bsdpDataSource)} />
        </div>
    );
}


