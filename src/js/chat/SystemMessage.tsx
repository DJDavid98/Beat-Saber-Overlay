import { FC } from 'react';
import { ChatMessageBody } from './ChatMessageBody';
import { ChatSystemMessage, SystemMessageType } from '../utils/chat-messages';

const messageTypeColorMap: Record<SystemMessageType, string> = {
    [SystemMessageType.INFO]: '#aaa',
    [SystemMessageType.SUCCESS]: '#afa',
    [SystemMessageType.ERROR]: '#faa',
    [SystemMessageType.WARN]: '#fd0',
    [SystemMessageType.FOLLOW]: '#7ba6f2',
    [SystemMessageType.DONATION]: '#ca0',
};

export const SystemMessage: FC<ChatSystemMessage> = ({ timestamp, message, type }) =>
    <ChatMessageBody
        timestamp={timestamp}
        message={message}
        messageColor={messageTypeColorMap[type]}
        emotes={undefined}
    />;
