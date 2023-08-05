import { CSSProperties, FC, Fragment, useMemo } from 'react';
import { ChatMessageBody } from './ChatMessageBody';
import { ChatUserMessage } from '../utils/chat-messages';
import { ChatPronouns } from './ChatPronouns';

export const UserMessage: FC<ChatUserMessage> = ({
    timestamp,
    message,
    nameColor,
    name,
    pronouns,
    emotes,
    messageColor,
}) => {
    const nameStyle: CSSProperties = useMemo(() => ({ color: nameColor }), [nameColor]);
    return <Fragment>
        <div className="chat-message-author">
            <ChatPronouns pronouns={pronouns} />
            <span className="chat-message-author-name" style={nameStyle}>{name}</span>
        </div>
        <ChatMessageBody
            timestamp={timestamp}
            message={message}
            emotes={emotes}
            messageColor={messageColor}
        />
    </Fragment>;
};
