import { FC } from 'react';
import { ChatUserMessage } from '../utils/chat-messages';

export const ChatPronouns: FC<Pick<ChatUserMessage, 'pronouns'>> = ({ pronouns }) => {
    if (!pronouns) return null;

    return <span className="chat-message-author-pronouns">{pronouns}</span>;
};
