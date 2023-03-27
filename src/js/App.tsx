import { FunctionComponent, useMemo } from "react";
import { DataDisplay, DataDisplayProps } from "./DataDisplay";
import { useBsdpData } from "./hooks/use-bsdp-data";
import { useBsPlusData } from "./hooks/use-bs-plus-data";
import { useMockData } from "./hooks/use-mock-data";

export const enum DataSource {
    BSDP = 'BSDP',
    BS_PLUS = 'BSPlus',
    MOCK = 'MOCK'
}

export interface AppProps {
    /**
     * When `true` the BeatSaberPlus SongOverlay data source will be used
     */
    dataSourceName: DataSource | string | null;
}

export const App: FunctionComponent<AppProps> = ({ dataSourceName }) => {
    const enabledSources: Record<DataSource, boolean> = useMemo(() => {
        let bsdpEnabled = dataSourceName === DataSource.BSDP;
        const mockEnabled = dataSourceName === DataSource.MOCK;
        const bsPlusEnabled = dataSourceName === DataSource.BS_PLUS;
        if (!dataSourceName) {
            bsdpEnabled = true;
        }
        return ({
            [DataSource.BSDP]: bsdpEnabled,
            [DataSource.BS_PLUS]: bsPlusEnabled,
            [DataSource.MOCK]: mockEnabled,
        });
    }, [dataSourceName]);
    const bsdpDataSource = useBsdpData(enabledSources.BSDP);
    const bsPlusDataSource = useBsPlusData(enabledSources.BSPlus);
    const mockDataSource = useMockData(enabledSources.MOCK);

    let dataSource: DataDisplayProps;
    switch (true) {
        case enabledSources.BSDP:
            dataSource = bsdpDataSource;
            break;
        case enabledSources.MOCK:
            dataSource = mockDataSource;
            break;
        case enabledSources.BSPlus:
            dataSource = bsPlusDataSource;
            break;
        default:
            throw new Error('No valid data source is enabled');
    }

    return (
        <div id="app">
            <DataDisplay {...dataSource} />
        </div>
    );
}


