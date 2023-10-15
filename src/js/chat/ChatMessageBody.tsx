import { FC, memo } from 'react';
import { ChatEmote } from './ChatEmote';
import { ChatUserMessage } from '../utils/chat-messages';
import { format } from 'date-fns';

const ChatMessageBodyComponent: FC<Pick<ChatUserMessage, 'timestamp' | 'tokens' | 'emoteOnly' | 'messageColor'>> = ({
    timestamp,
    tokens,
    emoteOnly,
    messageColor
}) => {
    const formattedTs = format(timestamp, 'HH:mm:ss');
    return <div className="chat-message-body" style={{ color: messageColor }}>
        <span className="chat-message-send-timestamp">{formattedTs}</span>
        {
            tokens.map((token, index) => {
                if (typeof token !== 'string')
                    return <ChatEmote key={index} {...token} large={emoteOnly} />;

                return <span key={index}>{token}</span>;
            })
        }</div>;
};

export const ChatMessageBody = memo(ChatMessageBodyComponent);
