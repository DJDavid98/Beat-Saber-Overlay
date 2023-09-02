import { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useSocket } from '../utils/socket-context';
import { ServerToClientEvents, } from '../model/app-scoket';
import {
    ChatSystemMessage,
    ChatUserMessage,
    DisplayableMessage,
    getChatWebsocketMessageTimestamp,
    SystemMessageType
} from '../utils/chat-messages';
import { ChatMessage } from './ChatMessage';
import DurationUnitFormat from 'intl-unofficial-duration-unit-format';

const MAX_MESSAGE_COUNT = 12;

export const Chat: FC = () => {
    const [messages, setMessages] = useState<Array<DisplayableMessage>>(() => []);
    const socket = useSocket();
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
            },
            follow(message) {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.FOLLOW,
                    message: `We have a new follower!`,
                };
                if (typeof message.total === 'number') {
                    data.message = data.message.replace('!', `, that's ${message.total} in total!`);
                }
                addMessage(data);
            },
            donation(message) {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.DONATION,
                    message: `${message.from} just donated!`,
                };
                addMessage(data);
            },
            chat(message) {
                const data: ChatUserMessage = {
                    id: message.tags.id || window.crypto.randomUUID(),
                    name: message.name,
                    username: message.username,
                    message: message.message,
                    nameColor: message.tags.color,
                    messageColor: undefined,
                    pronouns: message.pronouns,
                    emotes: message.tags.emotes,
                    timestamp: getChatWebsocketMessageTimestamp(message),
                };
                addMessage(data);
            },
            clearChat() {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.INFO,
                    message: `Chat has been cleared`,
                };
                setMessages([data]);
            },
            connect() {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.SUCCESS,
                    message: `Chat connected`,
                };
                addMessage(data);
            },
            disconnect() {
                const data: ChatSystemMessage = {
                    id: window.crypto.randomUUID(),
                    timestamp: new Date(),
                    type: SystemMessageType.ERROR,
                    message: `Chat disconnected`,
                };
                addMessage(data);
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
    }, [addMessage, df, socket]);

    return <Fragment>
        {messages.map(message => <ChatMessage key={message.id} message={message} />)}
    </Fragment>;
};
