import { FC, Fragment } from 'react';
import { ChatMessageBody } from './ChatMessageBody';
import { ChatUserMessage } from '../utils/chat-messages';
import { ChatPronouns } from './ChatPronouns';

export const UserMessage: FC<ChatUserMessage> = ({
    timestamp,
    name,
    pronouns,
    tokens,
    emoteOnly,
    messageColor,
}) => {
    return <Fragment>
        <div className="chat-message-author">
            <ChatPronouns pronouns={pronouns} />
            <span className="chat-message-author-name">{name}</span>
        </div>
        <ChatMessageBody
            timestamp={timestamp}
            tokens={tokens}
            emoteOnly={emoteOnly}
            messageColor={messageColor}
        />
    </Fragment>;
};
