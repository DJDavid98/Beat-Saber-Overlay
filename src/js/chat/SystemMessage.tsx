import { FC, useMemo } from 'react';
import { ChatMessageBody } from './ChatMessageBody';
import { accentColorCssVariable, ChatSystemMessage, tokenizeMessage } from '../utils/chat-messages';

export const SystemMessage: FC<ChatSystemMessage> = ({ timestamp, message }) => {
    const {
        tokens,
        emoteOnly
    } = useMemo(() => tokenizeMessage(message, undefined), [message]);
    return <ChatMessageBody
        timestamp={timestamp}
        tokens={tokens}
        messageColor={`var(${accentColorCssVariable})`}
        emoteOnly={emoteOnly}
    />;
};
