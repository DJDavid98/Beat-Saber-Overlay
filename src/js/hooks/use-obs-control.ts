import { useCallback, useEffect, useState } from "react";
import { isInBrowserSource } from "../utils/is-in-browser-source";
import { ReadyState } from "react-use-websocket";

const brbSceneName = 'BRB';
const mainSceneName = 'Main';
const farewellSceneName = 'Farewell';
const outroSongBsr = '39';

export const useObsControl = (mapDataReadyState: ReadyState, bsrKey: unknown) => {
    const [controlLevel, setControlLevel] = useState<OBSControlLevel>(0);
    const [streaming, setStreaming] = useState<OBSStatus['streaming']>(false);
    const [currentSceneName, setCurrentSceneName] = useState<OBSSceneInfo['name']>('');

    useEffect(() => {
        if (!isInBrowserSource()) return;

        window.obsstudio.getControlLevel((level) => {
            setControlLevel(level);
        });
        window.obsstudio.getStatus((status) => {
            setStreaming(status.streaming);
        });
        const listeners = {
            obsSceneChanged(event: CustomEvent<OBSSceneInfo>) {
                setCurrentSceneName(event.detail.name);
            },
            obsStreamingStarting() {
                setStreaming(true);
            },
            obsStreamingStopping() {
                setStreaming(false)
            },
        } satisfies Partial<{ [k in keyof OBSStudioEventMap]: (event: OBSStudioEventMap[k]) => void }>

        Object.entries(listeners).forEach(([event, handler]) => {
            window.addEventListener(event as never, handler as never);
        });
        return () => {
            Object.entries(listeners).forEach(([event, handler]) => {
                window.removeEventListener(event as never, handler as never);
            });
        };
    }, []);

    const getTargetSceneName = useCallback(() => {
        if (bsrKey === outroSongBsr) {
            // Show farewell screen for outro
            return farewellSceneName;
        }

        // Show BRB scene while overlay is disconnected during streaming
        return mapDataReadyState !== ReadyState.OPEN ? brbSceneName : mainSceneName;
    }, [bsrKey, mapDataReadyState]);

    useEffect(() => {
        // At sufficient control level, switch to the pre-defined scene
        if (controlLevel < 4 || !streaming) return;

        const targetSceneName = getTargetSceneName();
        if (currentSceneName !== targetSceneName) {
            window.obsstudio.setCurrentScene(targetSceneName);
        }
    }, [controlLevel, currentSceneName, getTargetSceneName, streaming]);
}
