import { FC } from 'react';
import { ChatUserMessage } from '../utils/chat-messages';

export const ChatPronouns: FC<Pick<ChatUserMessage, 'pronouns'>> = ({ pronouns }) => {
    if (pronouns.length === 0) return null;

    return <span className="chat-message-author-pronouns">{pronouns.join('/')}</span>;
};
