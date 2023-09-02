import { FC } from 'react';
import { ChatMessageBody } from './ChatMessageBody';
import { accentColorCssVariable, ChatSystemMessage } from '../utils/chat-messages';

export const SystemMessage: FC<ChatSystemMessage> = ({ timestamp, message }) =>
    <ChatMessageBody
        timestamp={timestamp}
        message={message}
        messageColor={`var(${accentColorCssVariable})`}
        emotes={undefined}
    />;
