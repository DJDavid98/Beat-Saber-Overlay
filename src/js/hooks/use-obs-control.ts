import { useCallback, useEffect } from 'react';
import { ReadyState } from 'react-use-websocket';
import { useObs } from './use-obs';
import { useSettings } from '../contexts/settings-context';
import { SettingName } from '../model/settings';

export const useObsControl = (mapDataReadyState: ReadyState, bsrKey: unknown) => {
    const {
        settings: {
            [SettingName.OBS_BRB_SCENE]: brbSceneName,
            [SettingName.OBS_PRIMARY_SCENE]: primarySceneName,
            [SettingName.OBS_FAREWELL_SCENE]: farewellSceneName,
            [SettingName.OUTRO_SONG_BSR]: outroSongBsr,
        }
    } = useSettings();
    const { controlLevel, streaming, currentSceneName } = useObs();

    const getTargetSceneName = useCallback(() => {
        if (bsrKey === outroSongBsr) {
            // Show farewell screen for outro
            return farewellSceneName;
        }

        // Show BRB scene while overlay is disconnected during streaming
        return mapDataReadyState !== ReadyState.OPEN ? brbSceneName : primarySceneName;
    }, [brbSceneName, bsrKey, farewellSceneName, primarySceneName, mapDataReadyState, outroSongBsr]);

    useEffect(() => {
        // At sufficient control level, switch to the pre-defined scene
        if (controlLevel < 4 || !streaming) return;

        const targetSceneName = getTargetSceneName();
        if (targetSceneName && currentSceneName !== targetSceneName) {
            window.obsstudio.setCurrentScene(targetSceneName);
        }
    }, [controlLevel, currentSceneName, getTargetSceneName, streaming]);
};
