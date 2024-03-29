import { CSSProperties, FunctionComponent, useCallback, useMemo } from 'react';
import { DataDisplay, DataDisplayProps } from './DataDisplay';
import { useBsdpData } from '../hooks/use-bsdp-data';
import { useBsPlusData } from '../hooks/use-bs-plus-data';
import { useMockData } from '../hooks/use-mock-data';
import { useDisabledData } from '../hooks/use-disabled-data';
import { useSettings } from '../contexts/settings-context';
import { DEFAULT_BEAT_SABER_BASE_FONT_SIZE, SettingName, SettingsPage } from '../model/settings';
import { NotePile } from './NotePile';

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
            [SettingName.BEAT_SABER_DATA_SOURCE]: dataSourceName,
            [SettingName.BEAT_SABER_BASE_FONT_SIZE]: baseFontSize,
            [SettingName.BEAT_SABER_NOTES_PILE_ENABLED]: notesPileEnabled,
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

    const style = useMemo(() => ({ '--beat-saber-base-font-size': `${baseFontSize ?? DEFAULT_BEAT_SABER_BASE_FONT_SIZE}px` }) as CSSProperties, [baseFontSize]);

    return (
        <>
            <div id="beat-saber" style={style} onClick={openBeatSaberSettings}>
                <DataDisplay {...dataSource} />
            </div>
            {notesPileEnabled && enabledSources[BeatSaberDataSource.BSDP] &&
                <NotePile dataSource={dataSource} />}
        </>
    );
};


