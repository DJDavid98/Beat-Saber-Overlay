import {
    ChangeEventHandler,
    FC,
    FormEventHandler,
    useCallback,
    useEffect, useId,
    useRef,
    useState
} from 'react';
import { SettingName } from '../../model/settings';
import { useSettings } from '../../contexts/settings-context';
import { useObs } from '../../hooks/use-obs';
import * as styles from '../../../scss/modules/SettingsPageObsIntegration.module.scss';
import { BeatSaverMap } from '../../BeatSaverMap';

export const SettingsPageObsIntegration: FC = () => {
    const {
        settings: {
            [SettingName.OBS_PRIMARY_SCENE]: obsPrimaryScene,
            [SettingName.OBS_BRB_SCENE]: obsBrbScene,
            [SettingName.OBS_FAREWELL_SCENE]: obsFarewellScene,
            [SettingName.OUTRO_SONG_BSR]: outroSongBsr,
        },
        setSetting,
    } = useSettings();
    const [primarySceneInputValue, setPrimarySceneInputValue] = useState<string>('');
    const [brbSceneInputValue, setBrbSceneInputValue] = useState<string>('');
    const [farewellSceneInputValue, setFarewellSceneInputValue] = useState<string>('');
    const [outroSongInputValue, setOutroSongInputValue] = useState<string>('');
    const firstInputRef = useRef<HTMLInputElement>(null);
    const obs = useObs();
    const scenesDatalistId = useId();

    const updateInputValue = useCallback(() => {
        setPrimarySceneInputValue(obsPrimaryScene ?? '');
        setBrbSceneInputValue(obsBrbScene ?? '');
        setFarewellSceneInputValue(obsFarewellScene ?? '');
        setOutroSongInputValue(outroSongBsr ?? '');
    }, [obsPrimaryScene, obsBrbScene, obsFarewellScene, outroSongBsr]);
    const changePrimaryScene = useCallback(() => {
        setSetting(SettingName.OBS_PRIMARY_SCENE, primarySceneInputValue.trim());
    }, [primarySceneInputValue, setSetting]);
    const handlePrimarySceneInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setPrimarySceneInputValue(e.target.value);
    }, []);
    const changeBrbScene = useCallback(() => {
        setSetting(SettingName.OBS_BRB_SCENE, brbSceneInputValue.trim());
    }, [brbSceneInputValue, setSetting]);
    const handleBrbSceneInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setBrbSceneInputValue(e.target.value);
    }, []);
    const changeFarewellScene = useCallback(() => {
        setSetting(SettingName.OBS_FAREWELL_SCENE, farewellSceneInputValue.trim());
    }, [farewellSceneInputValue, setSetting]);
    const handleFarewellSceneInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setFarewellSceneInputValue(e.target.value);
    }, []);
    const changeOutroSong = useCallback(() => {
        setSetting(SettingName.OUTRO_SONG_BSR, outroSongInputValue.trim());
    }, [outroSongInputValue, setSetting]);
    const handleOutroSongInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setOutroSongInputValue(e.target.value);
    }, []);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback((e) => {
        e.preventDefault();
        changePrimaryScene();
        changeBrbScene();
        changeFarewellScene();
        changeOutroSong();
    }, [changePrimaryScene, changeBrbScene, changeFarewellScene, changeOutroSong]);

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
        <h2>Access level</h2>
        {obs.controlLevel
            ? <ol className={styles['obs-control-levels']}>
                <li className={obs.controlLevel >= 1 ? styles['access-granted'] : undefined}>
                    Read OBS status
                </li>
                <li className={obs.controlLevel >= 2 ? styles['access-granted'] : undefined}>
                    Read current Scene Collection, transitions
                </li>
                <li className={obs.controlLevel >= 3 ? styles['access-granted'] : undefined}>
                    Save replay buffer, etc.
                </li>
                <li className={obs.controlLevel >= 4 ? styles['access-granted'] : undefined}>
                    Change scenes, start/stop replay buffer, etc.
                </li>
                <li className={obs.controlLevel >= 5 ? styles['access-granted'] : undefined}>
                    Start/stop streaming without warning, etc.
                </li>
            </ol>
            :
            <p>{obs.inBrowserSource ? 'No access given' : 'Page is not loaded inside an OBS Browser Source'},
                all integrations are disabled.</p>
        }
        <details open>
            <summary>
                <h2>Auto Scene Switch</h2>
            </summary>
            <p>Automatically change between the Primary and BRB scenes when the Beat Saber
                connection is lost/restored, and to the Farewell scene when playing the Outro
                Song.</p>
            <p>Requires access level 4, and scene changes only happen while streaming.</p>
            <h3>Primary Scene</h3>
            <p>Shown while the Beat Saber socket is connected, indicating the game is running.</p>
            <input
                type="text"
                name="primary-scene"
                autoComplete="off"
                value={primarySceneInputValue}
                onChange={handlePrimarySceneInputChange}
                ref={firstInputRef}
                list={scenesDatalistId}
            />
            <h3>BRB Scene</h3>
            <p>Shown while the Beat Saber socket is disconnected, indicating the game is not
                running.</p>
            <input
                type="text"
                name="brb-scene"
                autoComplete="off"
                value={brbSceneInputValue}
                onChange={handleBrbSceneInputChange}
                list={scenesDatalistId}
            />
            <h3>Farewell Scene</h3>
            <p>Shown while the Beat Saber socket is connected and the current map matches the
                configured Outro Song.</p>
            <input
                type="text"
                name="farewell-scene"
                autoComplete="off"
                value={farewellSceneInputValue}
                onChange={handleFarewellSceneInputChange}
                list={scenesDatalistId}
            />
            <h3>Outro Song</h3>
            <p>The <a
                href="https://beatsaver.com"
                target="_blank"
                rel="noreferrer noopener"
            >BeatSaver</a> song ID which is played as the outro for the stream. Playing this
                triggers the change to the Farewell scene.</p>
            <p>This is the same code you would use to request a song via chat using
                the <code>!bsr</code> command</p>
            <input
                type="text"
                name="outro-song"
                value={outroSongInputValue}
                onChange={handleOutroSongInputChange}
                pattern="^[a-fA-F\d]+$"
            />
            <BeatSaverMap mapId={outroSongInputValue} />
        </details>
        <datalist id={scenesDatalistId}>
            {obs.allSceneNames.map(sceneName => <option key={sceneName} value={sceneName} />)}
        </datalist>
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
    </form>;
};
