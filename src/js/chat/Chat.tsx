import { FC, useCallback, useEffect, useState } from 'react';
import { useSocket } from '../utils/socket-context';
import { ChatWebsocketMessage, DonationWebsocketMessage, } from '../model/app-scoket';
import { UserMessage } from './UserMessage';
import { useAutoScrollToBottom } from '../hooks/use-auto-scroll-to-bottom';
import { SystemMessage } from './SystemMessage';
import {
    ChatSystemMessage,
    ChatUserMessage,
    DisplayableMessage,
    getChatWebsocketMessageTimestamp,
    SystemMessageType
} from '../utils/chat-messages';

const MAX_MESSAGE_COUNT = 12;

export const Chat: FC = () => {
    const chatRef = useAutoScrollToBottom<HTMLDivElement>();
    const [messages, setMessages] = useState<Array<DisplayableMessage>>(() => []);
    const socket = useSocket();

    const addMessage = useCallback((data: DisplayableMessage) => {
        setMessages((oldState) =>
            [...oldState, data]
                .sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf())
                .slice(-MAX_MESSAGE_COUNT));
    }, []);

    useEffect(() => {
        if (!socket) return;

        const joinedRoomEventListener = (room: string) => {
            const data: ChatSystemMessage = {
                timestamp: new Date(),
                type: SystemMessageType.INFO,
                message: `Joined room #${room}`,
            };
            addMessage(data);
        };
        const followEventListener = () => {
            const data: ChatSystemMessage = {
                timestamp: new Date(),
                type: SystemMessageType.FOLLOW,
                message: `We have a new follower!`,
            };
            addMessage(data);
        };
        const donationEventListener = (message: DonationWebsocketMessage) => {
            const data: ChatSystemMessage = {
                timestamp: new Date(),
                type: SystemMessageType.DONATION,
                message: `${message.from} just donated!`,
            };
            addMessage(data);
        };
        const chatEventListener = (message: ChatWebsocketMessage) => {
            const data: ChatUserMessage = {
                id: message.tags.id || window.crypto.randomUUID(),
                name: message.name,
                message: message.message,
                nameColor: message.tags.color,
                pronouns: message.pronouns,
                timestamp: getChatWebsocketMessageTimestamp(message),
            };
            addMessage(data);
        };
        const clearChatEventListener = () => setMessages([]);
        socket.on('joinedRoom', joinedRoomEventListener);
        socket.on('follow', followEventListener);
        socket.on('donation', donationEventListener);
        socket.on('chat', chatEventListener);
        socket.on('clearChat', clearChatEventListener);

        return () => {
            socket.off('joinedRoom', joinedRoomEventListener);
            socket.off('follow', followEventListener);
            socket.off('donation', donationEventListener);
            socket.off('chat', chatEventListener);
            socket.off('clearChat', clearChatEventListener);
        };
    }, [addMessage, socket]);

    return <div id="chat" ref={chatRef}>
        {messages.map(message => (
            'type' in message
                ? <SystemMessage key={message.timestamp.valueOf()} {...message} />
                : <UserMessage key={message.id} {...message} />)
        )}
    </div>;
};
