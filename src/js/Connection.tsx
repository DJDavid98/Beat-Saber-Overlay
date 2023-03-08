import { FunctionComponent } from "react";
import { Loading } from "./Loading";
import { ReadyState } from "react-use-websocket";

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

export const Connection: FunctionComponent<{ readyState: ReadyState }> = ({ readyState }) =>
    <>
        <div id="connection">
            <span className="status">Overlay status</span>
            <span className="status-value">{mapConnectionState(readyState)}</span>
        </div>
        <Loading id="connection-loading" />
    </>
