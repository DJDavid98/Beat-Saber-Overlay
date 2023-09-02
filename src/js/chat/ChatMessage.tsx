import { CSSProperties, FC, memo, useMemo } from 'react';
import {
    accentColor20CssVariable,
    accentColor80CssVariable,
    accentColorCssVariable,
    DisplayableMessage,
    getAccentColor
} from '../utils/chat-messages';
import { SystemMessage } from './SystemMessage';
import { UserMessage } from './UserMessage';
import classNames from 'classnames';

const ChatMessageComponent: FC<{ message: DisplayableMessage }> = ({ message }) => {
    const isSystemMessage = 'type' in message;
    const accentColorStyle = useMemo((): CSSProperties => {
        const accentColor = getAccentColor(message);
        if (accentColor) {
            const match = accentColor.substring(1).match(/[a-f\d]{2}/ig);
            if (match && match.length === 3) {
                const [r, g, b] = match.map(n => parseInt(n, 16));
                return ({
                    [accentColorCssVariable]: `rgb(${r},${g},${b})`,
                    [accentColor80CssVariable]: `rgba(${r},${g},${b},.8)`,
                    [accentColor20CssVariable]: `rgba(${r},${g},${b},.2)`,
                }) as CSSProperties;
            }
            return ({ [accentColorCssVariable]: accentColor }) as CSSProperties;
        }
        return {};
    }, [message]);
    return <div
        className={classNames('chat-message', { ['chat-message-system']: isSystemMessage })}
        style={accentColorStyle}
    >{
        isSystemMessage
            ? <SystemMessage key={message.id} {...message} />
            : <UserMessage key={message.id} {...message} />
    }</div>;
};

export const ChatMessage = memo(ChatMessageComponent);
