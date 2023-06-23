import { FunctionComponent, useEffect, useState } from "react";
import { Loading } from "./Loading";
import { ReadyState } from "react-use-websocket";
import { TimeElapsed } from "./TimeElapsed";

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
    const [displayTime, setDisplayTime] = useState<Date | null>(null);

    useEffect(() => {
        setDisplayTime(new Date());

        return () => setDisplayTime(null);
    }, []);

    return <div id="connection-component">
        <div id="connection-wrap">
            <div id="connection">
                <span className="status">Overlay status</span>
                <span className="status-value">{mapConnectionState(readyState)}</span>
            </div>
            <Loading id="connection-loading" />
        </div>
        {displayTime !== null && <TimeElapsed since={displayTime} />}
    </div>;
}
