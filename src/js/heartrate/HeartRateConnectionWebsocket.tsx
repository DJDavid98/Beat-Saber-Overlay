import {
    ChangeEventHandler,
    FC,
    FormEventHandler,
    MouseEvent,
    MouseEventHandler,
    useCallback,
    useRef,
    useState
} from "react";
import { WebsocketHeartRate } from "../hooks/use-websocket-heart-rate";
import { ReadyState } from "react-use-websocket";
import { Loading } from "../Loading";

export const HeartRateConnectionWebsocket: FC<{
    websocketHeartRate: WebsocketHeartRate
}> = ({ websocketHeartRate }) => {
    const [hostInputValue, setHostInputValue] = useState<string>('');
    const [pathInputValue, setPathInputValue] = useState<string>('');
    const [hostInputHidden, setHostInputHidden] = useState(true);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const updateInputValues = useCallback(() => {
        setHostInputValue(websocketHeartRate.getHost() ?? '');
        setPathInputValue(websocketHeartRate.getPath() ?? '');
        setHostInputHidden(true);
    }, [websocketHeartRate]);
    const showDialog = useCallback(() => {
        updateInputValues();
        dialogRef.current?.showModal();
        firstInputRef.current?.focus();
    }, [updateInputValues]);
    const closeDialog = useCallback((e?: MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();

        dialogRef.current?.close();
    }, []);
    const saveSettings: FormEventHandler = useCallback((e) => {
        e.preventDefault();

        websocketHeartRate.changeHost(hostInputValue);
        websocketHeartRate.changePath(pathInputValue);
        closeDialog();
    }, [websocketHeartRate, hostInputValue, pathInputValue, closeDialog]);
    const handleTokenInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setHostInputValue(e.target.value);
    }, []);
    const handlePathInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setPathInputValue(e.target.value);
    }, []);
    const toggleHostVisibility: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
        e.preventDefault();

        setHostInputHidden((wasHidden) => !wasHidden);
    }, []);

    return <>
        {websocketHeartRate.readyState === ReadyState.CONNECTING
            ? <Loading id="websocket-loading" />
            : <button
                id="websocket-config"
                className={`connection-button ${websocketHeartRate.deviceClass}`}
                onClick={showDialog}
                title="Websocket Options"
            />}

        <dialog ref={dialogRef}>
            <form onSubmit={saveSettings}>
                <h1>Websocket Heart Rate Connection</h1>
                <h2>Server Host</h2>
                <p>Enter the full URL of the WebSocket server, including port number and any query parameters.</p>
                <p>This typically starts with <code>ws://</code> or <code>wss://</code> and may contain secret keys.</p>
                <input
                    type={hostInputHidden ? "password" : "url"}
                    name="websocket-host"
                    autoComplete="off"
                    value={hostInputValue}
                    onChange={handleTokenInputChange}
                    ref={firstInputRef}
                    className="small"
                    placeholder="Enter URL to enable"
                />
                <p>To avoid displaying sensitive info by accident, the input value is masked.
                    <button
                        type="button"
                        onClick={toggleHostVisibility}
                        className="inline"
                    >{hostInputHidden ? 'Reveal' : 'Conceal'}
                    </button>
                </p>
                <h2>Data Location</h2>
                <p>Enter the path to the heart rate data within the JSON response, separating nested keys
                    with <code>.</code></p>
                <p>If left blank, the socket data is assumed to be plain text containing the numbers only.</p>
                <input
                    type="test"
                    name="websocket-host"
                    autoComplete="off"
                    value={pathInputValue}
                    onChange={handlePathInputChange}
                    pattern="^[a-z\d_.-]+$"
                    placeholder="Enter path in JSON data (optional)"
                />
                <button type="submit">Save</button>
                <button type="button" onClick={closeDialog}>Cancel</button>
            </form>
        </dialog>
    </>
}
