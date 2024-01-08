import {
    ChangeEventHandler,
    FC,
    FormEventHandler,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import { useSettings } from '../../contexts/settings-context';
import { DEFAULT_BEAT_SABER_BASE_FONT_SIZE, SettingName } from '../../model/settings';
import { BeatSaberDataSource, isValidBeatSaberDataSource } from '../../beat-saber/BeatSaber';
import { LabelledInput } from '../LabelledInput';
import { ExternalLink } from '../../ExternalLink';
import { settingValidators } from '../../utils/settings';

export const SettingsPageBeatSaber: FC = () => {
    const {
        settings: {
            [SettingName.BEAT_SABER_DATA_SOURCE]: dataSource,
            [SettingName.BEAT_SABER_BASE_FONT_SIZE]: baseFontSize,
        },
        setSetting,
    } = useSettings();
    const [dataSourceInputValue, setDataSourceInputValue] = useState<BeatSaberDataSource | null>(null);
    const [baseFontSizeInputValue, setBaseFontSizeInputValue] = useState<number>(DEFAULT_BEAT_SABER_BASE_FONT_SIZE);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const updateInputValue = useCallback(() => {
        setDataSourceInputValue(dataSource ?? BeatSaberDataSource.BSDP);
        setBaseFontSizeInputValue(baseFontSize ?? DEFAULT_BEAT_SABER_BASE_FONT_SIZE);
    }, [baseFontSize, dataSource]);
    const changeDataSource = useCallback(() => {
        setSetting(SettingName.BEAT_SABER_DATA_SOURCE, dataSourceInputValue);
    }, [dataSourceInputValue, setSetting]);
    const changeBaseFontSize = useCallback(() => {
        setSetting(SettingName.BEAT_SABER_BASE_FONT_SIZE, baseFontSizeInputValue);
    }, [baseFontSizeInputValue, setSetting]);
    const handleDataSourceInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        const { value } = e.target;
        setDataSourceInputValue(isValidBeatSaberDataSource(value) ? value : null);
    }, []);
    const handleBaseFontSizeInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        const inputValue = parseInt(e.target.value, 10);
        if (settingValidators[SettingName.BEAT_SABER_BASE_FONT_SIZE](inputValue) !== null) {
            setBaseFontSizeInputValue(inputValue);
        } else {
            setBaseFontSizeInputValue(DEFAULT_BEAT_SABER_BASE_FONT_SIZE);
        }
    }, []);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback((e) => {
        e.preventDefault();
        changeDataSource();
        changeBaseFontSize();
    }, [changeBaseFontSize, changeDataSource]);

    // Used to reset the state of the page on mount/reset button click
    const init = useCallback(() => {
        updateInputValue();
        firstInputRef.current?.focus();
    }, [updateInputValue]);
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- This effect should only be called on mount
    }, []);

    return <form onSubmit={handleSubmit} onReset={init}>
        <details open>
            <summary>
                <h2>Data Source</h2>
            </summary>
            <p>The overlay supports a few different data sources for displaying the current song
                information, select one from the list below. The value of
                the <code>source</code> query parameter overwrites these settings on each page load.
                If you want to preserve your settings, load the overlay without that parameter.</p>
            <LabelledInput
                type="radio"
                name="bs-data-source"
                value={BeatSaberDataSource.BSDP}
                displayName="DataPuller"
                checked={dataSourceInputValue === BeatSaberDataSource.BSDP}
                onChange={handleDataSourceInputChange}
                ref={firstInputRef}
            >
                <p>Displays song information via
                    the <ExternalLink href="https://github.com/DJDavid98/BSDataPuller/">DataPuller</ExternalLink> mod,
                    it is the most complete and original source used for the overlay.</p>
            </LabelledInput>
            <LabelledInput
                type="radio"
                name="bs-data-source"
                value={BeatSaberDataSource.BS_PLUS}
                displayName="BeastSaber Plus"
                checked={dataSourceInputValue === BeatSaberDataSource.BS_PLUS}
                onChange={handleDataSourceInputChange}
            >
                <p>Displays song information via
                    the <ExternalLink href="https://github.com/hardcpp/BeatSaberPlus">BeatSaberPlus</ExternalLink> mod.
                    It can be used as a fallback when there is a new game version and only
                    this mod is updated. Displayed song information is limited when using
                    this source.</p>
            </LabelledInput>
            <LabelledInput
                type="radio"
                name="bs-data-source"
                value={BeatSaberDataSource.MOCK}
                displayName="Mock"
                checked={dataSourceInputValue === BeatSaberDataSource.MOCK}
                onChange={handleDataSourceInputChange}
            >
                <p>This source is primarily used for testing purposes to show how the overlay would
                    look when connected to a real data source using procedurally generated data and
                    events. Additional information about the mock data generation is logged to the
                    browser console while this source is active.</p>
            </LabelledInput>
        </details>
        <details open>
            <summary>
                <h2>Font size</h2>
            </summary>
            <p>The font size below is used to display song information and cover art at a specific
                size. If you need just the song overlay, increase this instead of resizing the
                source to prevent the result from becoming blurry.</p>
            <input
                type="number"
                name="beat-saber-base-font-size"
                autoComplete="off"
                value={baseFontSizeInputValue}
                onChange={handleBaseFontSizeInputChange}
                step="1"
            />
        </details>
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
    </form>;
};
