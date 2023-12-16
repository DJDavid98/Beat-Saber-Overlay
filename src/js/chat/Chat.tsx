import { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useSocket } from '../utils/socket-context';
import { ServerToClientEvents, } from '../model/app-scoket';
import {
    ChatSystemMessage,
    ChatUserMessage,
    DisplayableMessage,
    getChatWebsocketMessageTimestamp,
    isSongRequest,
    removeEmotes,
    SystemMessageType,
    tokenizeMessage,
} from '../utils/chat-messages';
import { ChatMessage } from './ChatMessage';
import DurationUnitFormat from 'intl-unofficial-duration-unit-format';
import { useSettings } from '../contexts/settings-context';
import { SettingName } from '../model/settings';
import { useTts } from '../hooks/use-tts';

const MAX_MESSAGE_COUNT = 12;

export const Chat: FC = () => {
    const {
        settings: {
            [SettingName.ELEVEN_LABS_TOKEN]: elevenLabsToken,
            [SettingName.TTS_ENABLED]: ttsEnabled,
            [SettingName.CHAT_SONG_PREVIEWS]: chatSongPreviews,
        }
    } = useSettings();
    const [messages, setMessages] = useState<Array<DisplayableMessage>>(() => []);
    const socket = useSocket();
    const tts = useTts(elevenLabsToken, ttsEnabled);
    const df = useMemo(() => new DurationUnitFormat('en-US', {
        style: DurationUnitFormat.styles.LONG,
        format: '{days} {hour} {minutes} {seconds}'
    }), []);

    const addMessage = useCallback((
        data: DisplayableMessage,
        transformOldState?: (oldState: Array<DisplayableMessage>) => Array<DisplayableMessage>
    ) => {
        setMessages((oldState) => {
            const transformedOldState = transformOldState ? transformOldState(oldState) : oldState;
            return [...transformedOldState, data]
                .sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf())
                .slice(-MAX_MESSAGE_COUNT);
        });
    }, []);

    useEffect(() => {
        if (!socket) return;

        const listeners: ServerToClientEvents = {
            joinedRoom(room: string) {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.INFO,
                    message: `Joined room #${room}`,
                };
                addMessage(data);
                tts.readText({ message: data.message });
            },
            follow(message) {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.FOLLOW,
                    message: 'We have a new follower!',
                };
                if (typeof message.total === 'number') {
                    data.message = data.message.replace('!', `, that's ${message.total} in total!`);
                }
                addMessage(data);
                tts.readText({ message: data.message });
            },
            donation(message) {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.DONATION,
                    message: `${message.from} just donated!`,
                };
                addMessage(data);
                tts.readText({ message: data.message });
            },
            chat(message) {
                if (!chatSongPreviews && isSongRequest(message.message)) {
                    return;
                }

                const {
                    tokens,
                    emoteOnly
                } = tokenizeMessage(message.message, message.tags.emotes);
                const messageId = message.tags.id || window.crypto.randomUUID();
                const data: ChatUserMessage = {
                    id: messageId,
                    name: message.name,
                    username: message.username,
                    nameColor: message.tags.color,
                    messageColor: undefined,
                    pronouns: message.pronouns,
                    message: message.message,
                    tokens,
                    emoteOnly,
                    timestamp: getChatWebsocketMessageTimestamp(message),
                };
                addMessage(data);
                if (!emoteOnly) {
                    tts.readText({
                        id: messageId,
                        name: message.username,
                        message: removeEmotes(tokens),
                        pronouns: message.pronouns
                    });
                }
            },
            clearChat() {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.INFO,
                    message: `Chat has been cleared`,
                };
                setMessages([data]);
                tts.clearQueue();
            },
            connect() {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.SUCCESS,
                    message: `Chat connected`,
                };
                addMessage(data);
                tts.readText({ message: data.message });
            },
            disconnect() {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.ERROR,
                    message: `Chat disconnected`,
                };
                addMessage(data);
                tts.readText({ message: data.message });
            },
            ban(message) {
                let data: ChatSystemMessage | undefined;
                if (message.detail) {
                    const action = typeof message.detail.timeout === 'number'
                        ? `timed out for ${df.format(message.detail.timeout)}`
                        : 'permanently banned';
                    const reason = message.detail.reason ? ` (${message.detail.reason})` : '';
                    const bannedBy = message.detail.bannedBy ? ` by ${message.detail.bannedBy}` : '';
                    data = {
                        id: window.crypto.randomUUID(),
                        timestamp: new Date(),
                        type: SystemMessageType.WARN,
                        message: `${message.username} has been ${action}${bannedBy}${reason}`,
                    };
                }
                const filteredMessageIds: string[] = [];
                const filterMessagesFromUser = (oldState: Array<DisplayableMessage>) => {
                    return (
                        oldState.filter(m => {
                            const keepMessage = 'username' in m ? m.username !== message.username : true;
                            if (!keepMessage && m.id) {
                                filteredMessageIds.push(m.id);
                            }
                            return keepMessage;
                        })
                    );
                };
                if (data) {
                    addMessage(data, filterMessagesFromUser);
                } else {
                    setMessages((oldState) => filterMessagesFromUser(oldState));
                }
                tts.clearIds(filteredMessageIds);
            },
            messageDeleted(data) {
                setMessages((oldState) => oldState.filter(message => message.id !== data.id));
                tts.clearIds([data.id]);
            }
        };
        for (const eventKey in listeners) {
            const kex = eventKey as keyof ServerToClientEvents;
            socket.on(kex, listeners[kex]);
        }

        return () => {
            for (const eventKey in listeners) {
                const kex = eventKey as keyof ServerToClientEvents;
                socket.off(kex, listeners[kex]);
            }
        };
    }, [addMessage, chatSongPreviews, df, socket, tts]);

    return <Fragment>
        {messages.map(message => <ChatMessage key={message.id} message={message} />)}
    </Fragment>;
};
