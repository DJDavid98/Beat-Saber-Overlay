import {
    ChangeEventHandler,
    FC, FormEvent,
    FormEventHandler,
    useCallback,
    useEffect, useId,
    useRef,
    useState
} from 'react';
import { useSettings } from '../../contexts/settings-context';
import { SettingName } from '../../model/settings';
import { BeatSaverMap } from '../../BeatSaverMap';
import { ExternalLink } from '../../ExternalLink';

export const SettingsPageChatOverlay: FC = () => {
    const {
        settings: {
            [SettingName.CHAT_SOCKET_SERVER_URL]: serverUrl,
            [SettingName.CHAT_SOCKET_ROOM]: room,
            [SettingName.ELEVEN_LABS_TOKEN]: elevenLabsToken,
            [SettingName.TTS_ENABLED]: ttsEnabled,
            [SettingName.CHAT_SONG_PREVIEWS]: songPreviews,
        },
        setSetting,
    } = useSettings();
    const [serverUrlInputValue, setServerUrlInputValue] = useState<string>('');
    const [roomInputValue, setRoomInputValue] = useState<string>('');
    const [tokenInputValue, setTokenInputValue] = useState<string>('');
    const [ttsEnabledInputValue, setTtsEnabledInputValue] = useState(false);
    const [songPreviewsInputValue, setSongPreviewsInputValue] = useState(false);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const songPreviewsInputId = useId();
    const ttsInputId = useId();

    const updateInputValue = useCallback(() => {
        setServerUrlInputValue(serverUrl ?? '');
        setRoomInputValue(room ?? '');
        setTokenInputValue(elevenLabsToken ?? '');
        setTtsEnabledInputValue(ttsEnabled ?? false);
        setSongPreviewsInputValue(songPreviews ?? false);
    }, [elevenLabsToken, room, serverUrl, songPreviews, ttsEnabled]);
    const changeHost = useCallback(() => {
        setSetting(SettingName.CHAT_SOCKET_SERVER_URL, serverUrlInputValue.trim());
    }, [serverUrlInputValue, setSetting]);
    const handleHostInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setServerUrlInputValue(e.target.value);
    }, []);
    const changePath = useCallback(() => {
        setSetting(SettingName.CHAT_SOCKET_ROOM, roomInputValue.trim());
    }, [roomInputValue, setSetting]);
    const handlePathInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setRoomInputValue(e.target.value);
    }, []);
    const updateToken = useCallback(() => {
        setSetting(SettingName.ELEVEN_LABS_TOKEN, tokenInputValue.trim());
    }, [setSetting, tokenInputValue]);
    const handleTokenInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setTokenInputValue(e.target.value);
    }, []);
    const changeTtsEnabled = useCallback(() => {
        setSetting(SettingName.TTS_ENABLED, ttsEnabledInputValue);
    }, [setSetting, ttsEnabledInputValue]);
    const handleTtsEnabledInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setTtsEnabledInputValue(e.target.checked);
    }, []);
    const changeSongPreviewsEnabled = useCallback(() => {
        setSetting(SettingName.CHAT_SONG_PREVIEWS, songPreviewsInputValue);
    }, [setSetting, songPreviewsInputValue]);
    const handleSongPreviewsInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setSongPreviewsInputValue(e.target.checked);
    }, []);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback((e) => {
        e.preventDefault();
        changeHost();
        changePath();
        changeSongPreviewsEnabled();
        changeTtsEnabled();
        updateToken();
    }, [changeHost, changePath, changeSongPreviewsEnabled, changeTtsEnabled, updateToken]);

    // Used to reset the state of the page on mount/reset button click
    const init = useCallback((e?: FormEvent) => {
        e?.preventDefault();

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
                <h2>Connection</h2>
            </summary>
            <h3>Server URL</h3>
            <p>Enter the full URL of the <ExternalLink
                href="https://github.com/DJDavid98/DoubleColonBot"
            >DoubleColonBot</ExternalLink> server, including the port number</p>
            <input
                type="url"
                name="chat-socket-server-url"
                autoComplete="off"
                value={serverUrlInputValue}
                onChange={handleHostInputChange}
                ref={firstInputRef}
                className="small"
                placeholder="Enter URL to enable"
            />
            <h3>Room Name</h3>
            <p>Enter the Twitch login name of the user you want to display messages for</p>
            <p>The user must already be authenticated with the bot in order to display messages</p>
            <input
                type="text"
                name="chat-socket-room"
                autoComplete="off"
                value={roomInputValue}
                onChange={handlePathInputChange}
                pattern="^[a-z\d_\-]+$"
                placeholder="All lowercase, no special symbols"
            />
        </details>
        <details open>
            <summary>
                <h2>Song Requests</h2>
            </summary>

            <p>When a BeatSaver song is requested in chat via the <code>!bsr</code> command, its
                details will be visible as part of the chat message.</p>

            <p><input
                type="checkbox"
                name="song-previews"
                id={songPreviewsInputId}
                checked={songPreviewsInputValue}
                onChange={handleSongPreviewsInputChange}
            /> <label htmlFor={songPreviewsInputId}>Display song previews</label>
            </p>

            <p>Example:</p>

            <BeatSaverMap mapId="bd45" />
        </details>
        <details open>
            <summary>
                <h2>Text-to-Speech</h2>
            </summary>

            <p><input
                type="checkbox"
                name="tts-enabled"
                id={ttsInputId}
                checked={ttsEnabledInputValue}
                onChange={handleTtsEnabledInputChange}
            /> <label htmlFor={ttsInputId}>Read chat messages via ElevenLabs TTS</label></p>
            <p>Usernames and messages are processed before being passed to the API, e.g. omitting
                large numbers from names, adding spaces before capital letters in names, expansion
                of certain acronyms and slang words, etc.</p>
            <p>Emotes are only read out if they have a hard-coded text representation defined in the
                overlay.</p>

            <h3>ElevenLabs API Key</h3>
            <p>Generate a token on <ExternalLink
                href="https://elevenlabs.io/"
            >elevenlabs.io</ExternalLink> and paste it below.</p>
            <p>This requires a registered account with a verified e-mail address.</p>
            <p>Leave the input empty to remove an already stored API key.</p>
            <input
                type="password"
                name="elevenlabs-api-key"
                autoComplete="off"
                value={tokenInputValue}
                onChange={handleTokenInputChange}
            />
        </details>
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
    </form>;
};
