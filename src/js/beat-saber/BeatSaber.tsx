import { FunctionComponent, useCallback, useMemo } from 'react';
import { DataDisplay, DataDisplayProps } from './DataDisplay';
import { useBsdpData } from '../hooks/use-bsdp-data';
import { useBsPlusData } from '../hooks/use-bs-plus-data';
import { useMockData } from '../hooks/use-mock-data';
import { useDisabledData } from '../hooks/use-disabled-data';
import { useSettings } from '../contexts/settings-context';
import { SettingName, SettingsPage } from '../model/settings';

export const enum BeatSaberDataSource {
    BSDP = 'BSDP',
    BS_PLUS = 'BSPlus',
    MOCK = 'MOCK',
    OFF = 'OFF'
}

export const isValidBeatSaberDataSource = (input: string): input is BeatSaberDataSource =>
    input === BeatSaberDataSource.BSDP
    || input === BeatSaberDataSource.MOCK
    || input === BeatSaberDataSource.BS_PLUS;

export const BeatSaber: FunctionComponent = () => {
    const {
        settings: {
            [SettingName.BEAT_SABER_DATA_SOURCE]: dataSourceName
        },
        openSettings
    } = useSettings();
    const enabledSources: Record<BeatSaberDataSource, boolean> = useMemo(() => {
        let bsdpEnabled = dataSourceName === BeatSaberDataSource.BSDP;
        const mockEnabled = dataSourceName === BeatSaberDataSource.MOCK;
        const bsPlusEnabled = dataSourceName === BeatSaberDataSource.BS_PLUS;
        const disabled = dataSourceName === BeatSaberDataSource.OFF;
        if (!dataSourceName) {
            bsdpEnabled = true;
        }
        return ({
            [BeatSaberDataSource.BSDP]: bsdpEnabled,
            [BeatSaberDataSource.BS_PLUS]: bsPlusEnabled,
            [BeatSaberDataSource.MOCK]: mockEnabled,
            [BeatSaberDataSource.OFF]: disabled,
        });
    }, [dataSourceName]);
    const bsdpDataSource = useBsdpData(enabledSources.BSDP);
    const bsPlusDataSource = useBsPlusData(enabledSources.BSPlus);
    const mockDataSource = useMockData(enabledSources.MOCK);
    const disabledDataSource = useDisabledData();

    const openBeatSaberSettings = useCallback(() => {
        openSettings(SettingsPage.BEAT_SABER);
    }, [openSettings]);

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
        <div id="beat-saber" onClick={openBeatSaberSettings}>
            <DataDisplay {...dataSource} />
        </div>
    );
};


