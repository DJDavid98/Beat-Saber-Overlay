import { FC } from 'react';
import { ChatMessageBody } from './ChatMessageBody';
import { ChatSystemMessage, SystemMessageType } from '../utils/chat-messages';

const messageTypeColorMap: Record<SystemMessageType, string> = {
    [SystemMessageType.INFO]: '#808080',
    [SystemMessageType.FOLLOW]: '#7ba6f2',
    [SystemMessageType.DONATION]: '#ca0',
};

export const SystemMessage: FC<ChatSystemMessage> = ({ timestamp, message, type }) => {
    return <div className="chat-message chat-message-system">
        <ChatMessageBody
            timestamp={timestamp}
            message={message}
            messageColor={messageTypeColorMap[type]}
        />
    </div>;
};
