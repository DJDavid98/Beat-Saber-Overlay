import { FunctionComponent, useEffect, useState } from "react";
import { Loading } from "./Loading";
import { ReadyState } from "react-use-websocket";
import { isInBrowserSource } from "./utils/is-in-browser-source";

const brbSceneName = 'BRB';
const mainSceneName = 'Main';

const mapConnectionState = (state: ReadyState): string => {
    switch (state) {
        case ReadyState.CONNECTING:
            return "Connecting…";
        case ReadyState.OPEN:
            return "Connected";
        default:
            return "Disconnected";
    }
}

export const Connection: FunctionComponent<{ readyState: ReadyState }> = ({ readyState }) => {
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

    useEffect(() => {
        // At sufficient control level, switch to BRB scene while overlay is disconnected during streaming
        if (controlLevel < 4 || !streaming) return;

        const targetSceneName = readyState !== ReadyState.OPEN ? brbSceneName : mainSceneName;
        if (currentSceneName !== targetSceneName) {
            window.obsstudio.setCurrentScene(targetSceneName);
        }
    }, [controlLevel, currentSceneName, readyState, streaming]);

    return (
        <>
            <div id="connection">
                <span className="status">Overlay status</span>
                <span className="status-value">{mapConnectionState(readyState)}</span>
            </div>
            <Loading id="connection-loading" />
        </>
    )
}
