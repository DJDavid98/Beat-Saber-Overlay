import { FunctionComponent, useMemo } from 'react';
import { DataDisplay, DataDisplayProps } from './DataDisplay';
import { useBsdpData } from '../hooks/use-bsdp-data';
import { useBsPlusData } from '../hooks/use-bs-plus-data';
import { useMockData } from '../hooks/use-mock-data';
import { useDisabledData } from '../hooks/use-disabled-data';

export const enum DataSource {
    BSDP = 'BSDP',
    BS_PLUS = 'BSPlus',
    MOCK = 'MOCK',
    OFF = 'OFF'
}

export interface AppProps {
    /**
     * When `true` the BeatSaberPlus SongOverlay data source will be used
     */
    dataSourceName: DataSource | string | null;
}

export const BeatSaber: FunctionComponent<AppProps> = ({ dataSourceName }) => {
    const enabledSources: Record<DataSource, boolean> = useMemo(() => {
        let bsdpEnabled = dataSourceName === DataSource.BSDP;
        const mockEnabled = dataSourceName === DataSource.MOCK;
        const bsPlusEnabled = dataSourceName === DataSource.BS_PLUS;
        const disabled = dataSourceName === DataSource.OFF;
        if (!dataSourceName) {
            bsdpEnabled = true;
        }
        return ({
            [DataSource.BSDP]: bsdpEnabled,
            [DataSource.BS_PLUS]: bsPlusEnabled,
            [DataSource.MOCK]: mockEnabled,
            [DataSource.OFF]: disabled,
        });
    }, [dataSourceName]);
    const bsdpDataSource = useBsdpData(enabledSources.BSDP);
    const bsPlusDataSource = useBsPlusData(enabledSources.BSPlus);
    const mockDataSource = useMockData(enabledSources.MOCK);
    const disabledDataSource = useDisabledData();

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
        case enabledSources.OFF:
            dataSource = disabledDataSource;
            break;
        default:
            throw new Error('No valid data source is enabled');
    }

    return (
        <div id="beat-saber">
            <DataDisplay {...dataSource} />
        </div>
    );
};


