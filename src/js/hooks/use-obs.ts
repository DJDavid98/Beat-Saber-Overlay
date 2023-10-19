import { useCallback, useEffect, useMemo, useState } from 'react';
import { isInBrowserSource } from '../utils/is-in-browser-source';

export const useObs = () => {
    const inBrowserSource = useMemo(() => isInBrowserSource(), []);
    const [controlLevel, setControlLevel] = useState<OBSControlLevel>(0);
    const [streaming, setStreaming] = useState<OBSStatus['streaming']>(false);
    const [currentSceneName, setCurrentSceneName] = useState<OBSSceneInfo['name']>('');
    const [allSceneNames, setAllSceneNames] = useState<OBSSceneInfo['name'][]>([]);

    const updateScenes = useCallback(() => {
        window.obsstudio.getScenes((scenes) => {
            setAllSceneNames(scenes);
        });
    }, []);

    useEffect(() => {
        if (!inBrowserSource) return;

        window.obsstudio.getControlLevel((level) => {
            setControlLevel(level);
        });
        window.obsstudio.getStatus((status) => {
            setStreaming(status !== null && status.streaming);
        });
        updateScenes();
        const listeners = {
            obsSceneChanged(event: CustomEvent<OBSSceneInfo>) {
                setCurrentSceneName(event.detail.name);
                updateScenes();
            },
            obsStreamingStarting() {
                setStreaming(true);
            },
            obsStreamingStopping() {
                setStreaming(false);
            },
        } satisfies Partial<{ [k in keyof OBSStudioEventMap]: (event: OBSStudioEventMap[k]) => void }>;

        Object.entries(listeners).forEach(([event, handler]) => {
            window.addEventListener(event as never, handler as never);
        });
        return () => {
            Object.entries(listeners).forEach(([event, handler]) => {
                window.removeEventListener(event as never, handler as never);
            });
        };
    }, [inBrowserSource, updateScenes]);

    return {
        inBrowserSource,
        controlLevel,
        streaming,
        currentSceneName,
        allSceneNames
    };
};
