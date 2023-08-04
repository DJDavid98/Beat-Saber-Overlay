import { CSSProperties, FC, useMemo } from 'react';
import { ChatWebsocketMessage } from '../model/app-scoket';
import { ChatMessageBody } from './ChatMessageBody';

export const ChatMessage: FC<ChatWebsocketMessage> = ({ message, tags, name, pronouns }) => {
    const nameStyle: CSSProperties = useMemo(() => ({ color: tags.color }), [tags.color]);
    return <div className="chat-message">
        <div className="chat-message-author">
            {pronouns && <span className="chat-message-author-pronouns">{pronouns}</span>}
            <span className="chat-message-author-name" style={nameStyle}>{name}</span>
        </div>
        <ChatMessageBody message={message} tags={tags} />
    </div>;
};
