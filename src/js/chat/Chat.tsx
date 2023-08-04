import { FC, useEffect, useState } from 'react';
import { useSocket } from '../utils/socket-context';
import { ChatWebsocketMessage } from '../model/app-scoket';
import { ChatMessage } from './ChatMessage';

const MAX_MESSAGE_COUNT = 5;

export const Chat: FC = () => {
    const [messages, setMessages] = useState<Array<ChatWebsocketMessage>>(() => []);
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        const chatEventListener = (message: ChatWebsocketMessage) => {
            setMessages((oldState) => [...oldState, message].slice(-MAX_MESSAGE_COUNT));
        };
        const clearChatEventListener = () => setMessages([]);
        socket.on('chat', chatEventListener);
        socket.on('clearChat', clearChatEventListener);

        return () => {
            socket.off('chat', chatEventListener);
            socket.off('clearChat', clearChatEventListener);
        };
    }, [socket]);

    return <div id="chat">
        {messages.map(message => <ChatMessage key={message.tags.id} {...message} />)}
    </div>;
};
