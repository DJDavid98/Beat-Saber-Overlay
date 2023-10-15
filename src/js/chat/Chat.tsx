import { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useSocket } from '../utils/socket-context';
import { ServerToClientEvents, } from '../model/app-scoket';
import {
    ChatSystemMessage,
    ChatUserMessage,
    DisplayableMessage,
    getChatWebsocketMessageTimestamp, removeEmotes,
    SystemMessageType, tokenizeMessage, ttsNameSubstitutions
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
                tts.readText(data.message);
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
                tts.readText(data.message);
            },
            donation(message) {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.DONATION,
                    message: `${message.from} just donated!`,
                };
                addMessage(data);
                tts.readText(data.message);
            },
            chat(message) {
                const { tokens, emoteOnly } = tokenizeMessage(message.message, message.tags.emotes);
                const data: ChatUserMessage = {
                    id: message.tags.id || window.crypto.randomUUID(),
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
                    tts.readText(`${ttsNameSubstitutions(message.username)}. ${removeEmotes(tokens)}`);
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
                tts.readText(data.message);
            },
            disconnect() {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.ERROR,
                    message: `Chat disconnected`,
                };
                addMessage(data);
                tts.readText(data.message);
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
                const filterMessagesFromUser = (oldState: Array<DisplayableMessage>) => (
                    oldState.filter(m => 'username' in m ? m.username !== message.username : true)
                );
                if (data) {
                    addMessage(data, filterMessagesFromUser);
                } else {
                    setMessages((oldState) => filterMessagesFromUser(oldState));
                }
            },
            messageDeleted(data) {
                setMessages((oldState) => oldState.filter(message => message.id !== data.id));
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
    }, [addMessage, df, socket, tts]);

    return <Fragment>
        {messages.map(message => <ChatMessage key={message.id} message={message} />)}
    </Fragment>;
};
