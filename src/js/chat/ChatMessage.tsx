import { FC, memo } from 'react';
import { DisplayableMessage } from '../utils/chat-messages';
import { SystemMessage } from './SystemMessage';
import { UserMessage } from './UserMessage';
import classNames from 'classnames';

const ChatMessageComponent: FC<{ message: DisplayableMessage }> = ({ message }) => {
    const isSystemMessage = 'type' in message;
    return <div className={classNames('chat-message', { ['chat-message-system']: isSystemMessage })}>{
        isSystemMessage
            ? <SystemMessage key={message.id} {...message} />
            : <UserMessage key={message.id} {...message} />
    }</div>;
};

export const ChatMessage = memo(ChatMessageComponent);
