import {
    ChangeEventHandler,
    FC,
    FormEventHandler,
    MouseEventHandler,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import { useSettings } from '../../contexts/settings-context';
import { SettingName } from '../../model/settings';
import { ExternalLink } from '../../ExternalLink';

export const SettingsPageHeartRate: FC = () => {
    const {
        settings: {
            [SettingName.PULSOID_TOKEN]: pulsoidToken,
            [SettingName.HEART_RATE_WEBSOCKET_HOST]: websocketHost,
            [SettingName.HEART_RATE_WEBSOCKET_PATH]: websocketPath,
        },
        setSetting,
    } = useSettings();
    const [hostInputValue, setHostInputValue] = useState<string>('');
    const [pathInputValue, setPathInputValue] = useState<string>('');
    const [hostInputHidden, setHostInputHidden] = useState(true);
    const [tokenInputValue, setTokenInputValue] = useState<string>('');
    const firstInputRef = useRef<HTMLInputElement>(null);

    const updateInputValue = useCallback(() => {
        setHostInputValue(websocketHost ?? '');
        setPathInputValue(websocketPath ?? '');
        setTokenInputValue(pulsoidToken ?? '');
    }, [pulsoidToken, websocketHost, websocketPath]);
    const toggleHostVisibility: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
        e.preventDefault();

        setHostInputHidden((wasHidden) => !wasHidden);
    }, []);
    const changeHost = useCallback(() => {
        setSetting(SettingName.HEART_RATE_WEBSOCKET_HOST, hostInputValue.trim());
    }, [hostInputValue, setSetting]);
    const handleHostInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setHostInputValue(e.target.value);
    }, []);
    const changePath = useCallback(() => {
        setSetting(SettingName.HEART_RATE_WEBSOCKET_PATH, pathInputValue.trim());
    }, [pathInputValue, setSetting]);
    const handlePathInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setPathInputValue(e.target.value);
    }, []);
    const updateToken = useCallback(() => {
        setSetting(SettingName.PULSOID_TOKEN, tokenInputValue.trim());
    }, [setSetting, tokenInputValue]);
    const handleTokenInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setTokenInputValue(e.target.value);
    }, []);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback((e) => {
        e.preventDefault();
        updateToken();
        changeHost();
        changePath();
    }, [changeHost, changePath, updateToken]);

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
                <h2>Websocket</h2>
            </summary>
            <h3>Server Host</h3>
            <p>Enter the full URL of the WebSocket server, including port number and any query
                parameters.</p>
            <p>This typically starts with <code>ws://</code> or <code>wss://</code> and may
                contain secret keys.</p>
            <input
                type={hostInputHidden ? 'password' : 'url'}
                name="websocket-host"
                autoComplete="off"
                value={hostInputValue}
                onChange={handleHostInputChange}
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
            <h3>Data Location</h3>
            <p>Enter the path to the heart rate data within the JSON response, separating nested
                keys
                with <code>.</code></p>
            <p>If left blank, the socket data is assumed to be plain text containing the numbers
                only.</p>
            <input
                type="text"
                name="websocket-path"
                autoComplete="off"
                value={pathInputValue}
                onChange={handlePathInputChange}
                pattern="^[a-zA-Z\d_.-]+$"
                placeholder="Enter path in JSON data (optional)"
            />
        </details>
        <details open>
            <summary>
                <h2>Pulsoid</h2>
            </summary>

            <h3>Pulsoid API Key</h3>
            <p>Generate a token
                on <ExternalLink href="https://pulsoid.net/ui/keys">pulsoid.net</ExternalLink> and
                paste it below.</p>
            <p>This requires a paid Pulsoid subscription plan.</p>
            <p>Leave the input empty to remove an already stored API key.</p>
            <input
                type="password"
                name="pulsoid-api-key"
                autoComplete="off"
                value={tokenInputValue}
                onChange={handleTokenInputChange}
            />
        </details>
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
    </form>;
};
