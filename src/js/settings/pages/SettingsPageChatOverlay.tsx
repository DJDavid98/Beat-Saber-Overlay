import {
    ChangeEventHandler,
    FC,
    FormEvent,
    FormEventHandler,
    useCallback,
    useEffect,
    useId,
    useRef,
    useState
} from 'react';
import { useSettings } from '../../contexts/settings-context';
import { SettingName } from '../../model/settings';
import { BeatSaverMap } from '../../BeatSaverMap';
import { ExternalLink } from '../../ExternalLink';
import { LabelledInput } from '../LabelledInput';
import { isValidTtsProvider, TtsProvider } from '../../model/tts';

export const SettingsPageChatOverlay: FC = () => {
    const {
        settings: {
            [SettingName.CHAT_SOCKET_SERVER_URL]: serverUrl,
            [SettingName.CHAT_SOCKET_ROOM]: room,
            [SettingName.ELEVEN_LABS_TOKEN]: elevenLabsToken,
            [SettingName.TTS_ENABLED]: ttsEnabled,
            [SettingName.TTS_PROVIDER]: ttsProvider,
            [SettingName.PLAY_HT_USER_ID]: playHtUserId,
            [SettingName.PLAY_HT_TOKEN]: playHtToken,
            [SettingName.CHAT_SONG_PREVIEWS]: songPreviews,
        },
        setSetting,
    } = useSettings();
    const [serverUrlInputValue, setServerUrlInputValue] = useState<string>('');
    const [roomInputValue, setRoomInputValue] = useState<string>('');
    const [elevenLabsTokenInputValue, setElevenLabsTokenInputValue] = useState<string>('');
    const [playHtTokenInputValue, setPlayHtTokenInputValue] = useState<string>('');
    const [playHtUserIdInputValue, setPlayHtUserIdInputValue] = useState<string>('');
    const [ttsEnabledInputValue, setTtsEnabledInputValue] = useState(false);
    const [ttsProviderInputValue, setTtsProviderInputValue] = useState<TtsProvider | null>(null);
    const [songPreviewsInputValue, setSongPreviewsInputValue] = useState(false);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const songPreviewsInputId = useId();
    const ttsInputId = useId();

    const updateInputValue = useCallback(() => {
        setServerUrlInputValue(serverUrl ?? '');
        setRoomInputValue(room ?? '');
        setElevenLabsTokenInputValue(elevenLabsToken ?? '');
        setPlayHtTokenInputValue(playHtToken ?? '');
        setPlayHtUserIdInputValue(playHtUserId ?? '');
        setTtsEnabledInputValue(ttsEnabled ?? false);
        setTtsProviderInputValue(ttsProvider);
        setSongPreviewsInputValue(songPreviews ?? false);
    }, [elevenLabsToken, playHtToken, playHtUserId, room, serverUrl, songPreviews, ttsEnabled, ttsProvider]);
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
    const updateElevenLabsToken = useCallback(() => {
        setSetting(SettingName.ELEVEN_LABS_TOKEN, elevenLabsTokenInputValue.trim());
    }, [setSetting, elevenLabsTokenInputValue]);
    const handleElevenLabsTokenInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setElevenLabsTokenInputValue(e.target.value);
    }, []);
    const updatePlayHtToken = useCallback(() => {
        setSetting(SettingName.PLAY_HT_TOKEN, playHtTokenInputValue.trim());
    }, [setSetting, playHtTokenInputValue]);
    const handlePlayHtTokenInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setPlayHtTokenInputValue(e.target.value);
    }, []);
    const updatePlayHtUserId = useCallback(() => {
        setSetting(SettingName.PLAY_HT_USER_ID, playHtUserIdInputValue.trim());
    }, [setSetting, playHtUserIdInputValue]);
    const handlePlayHtUserIdInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setPlayHtUserIdInputValue(e.target.value);
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
    const updateTtsProvider = useCallback(() => {
        setSetting(SettingName.TTS_PROVIDER, ttsProviderInputValue);
    }, [setSetting, ttsProviderInputValue]);
    const handleTtsProviderInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        const { value } = e.target;
        setTtsProviderInputValue(isValidTtsProvider(value) ? value : null);
    }, []);

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback((e) => {
        e.preventDefault();
        changeHost();
        changePath();
        changeSongPreviewsEnabled();
        changeTtsEnabled();
        updateTtsProvider();
        updateElevenLabsToken();
        updatePlayHtToken();
        updatePlayHtUserId();
    }, [changeHost, changePath, changeSongPreviewsEnabled, changeTtsEnabled, updateElevenLabsToken, updatePlayHtToken, updatePlayHtUserId, updateTtsProvider]);

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

    const isPlayHtTts = ttsProviderInputValue === TtsProvider.PLAY_HT;
    const isElevenLabsTts = ttsProviderInputValue === TtsProvider.ELEVEN_LABS;

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
            /> <label htmlFor={ttsInputId}>Read chat messages via TTS</label></p>
            <p>Usernames and messages are processed before being passed to the API, e.g. omitting
                large numbers from names, adding spaces before capital letters in names, expansion
                of certain acronyms and slang words, etc.</p>
            <p>Emotes are only read out if they have a hard-coded text representation defined in the
                overlay.</p>

            <details open={ttsEnabledInputValue}>
                <summary>
                    <h3>Provider</h3>
                </summary>
                <p>The overlay supports a few different services for test-to-speech synthesis.</p>
                <LabelledInput
                    type="radio"
                    name="tts-provider"
                    value={TtsProvider.PLAY_HT}
                    displayName="PlayHT"
                    checked={isPlayHtTts}
                    onChange={handleTtsProviderInputChange}
                    disabled
                >
                    <p>Uses the <ExternalLink href="https://play.ht/">PlayHT</ExternalLink> API
                        (currently does not work due to API limitations)</p>
                </LabelledInput>
                <LabelledInput
                    type="radio"
                    name="tts-provider"
                    value={TtsProvider.ELEVEN_LABS}
                    displayName="ElevenLabs"
                    checked={isElevenLabsTts}
                    onChange={handleTtsProviderInputChange}
                >
                    <p>Uses
                        the <ExternalLink href="https://elevenlabs.io/">ElevenLabs</ExternalLink> API
                    </p>
                </LabelledInput>

                {isElevenLabsTts && <>
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
                        value={elevenLabsTokenInputValue}
                        onChange={handleElevenLabsTokenInputChange}
                    />
                </>}

                {isPlayHtTts && <>
                    <h3>PlayHT User ID</h3>
                    <p>Visit the <ExternalLink
                        href="https://play.ht/studio/api-access"
                    >API Access</ExternalLink> menu, copy the User ID and paste it below.</p>
                    <p>This requires a registering an account.</p>
                    <input
                        type="text"
                        name="playht-user-id"
                        value={playHtUserIdInputValue}
                        onChange={handlePlayHtUserIdInputChange}
                    />

                    <h3>PlayHT Secret Key</h3>
                    <p>Visit the <ExternalLink
                        href="https://play.ht/studio/api-access"
                    >API Access</ExternalLink> menu, generate a secret key if you have not done so
                        already, then paste it below.</p>
                    <p>Leave the input empty to remove an already stored secret key.</p>
                    <input
                        type="password"
                        name="playht-token"
                        autoComplete="off"
                        value={playHtTokenInputValue}
                        onChange={handlePlayHtTokenInputChange}
                    />
                </>}
            </details>
        </details>
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
    </form>;
};
