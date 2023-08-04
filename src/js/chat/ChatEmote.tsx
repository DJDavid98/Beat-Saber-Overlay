import { FC, memo } from 'react';
import classNames from 'classnames';

const getEmoteLink = (id: string, scale?: 1 | 2 | 3, suffix = true) => {
    let url = `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/${scale ?? 1}.0`;
    if (suffix) {
        switch (scale) {
            case 1:
            case 2:
                url += ` ${scale}x`;
                break;
            case 3:
                url += ` 4x`;
                break;
        }
    }
    return url;
};

export interface ChatEmoteProps {
    id: string;
    text?: string;
    large?: boolean;
}

const ChatEmoteComponent: FC<ChatEmoteProps> = ({ id, text, large }) => {
    const emoteUrl = getEmoteLink(id, large ? 3 : 1, false);
    const srcSet = `${getEmoteLink(id, 1)},${getEmoteLink(id, 2)},${getEmoteLink(id, 3)}`;
    return <img
        className={classNames('chat-message-emote', { large })}
        src={emoteUrl}
        srcSet={srcSet}
        alt={text}
    />;
};

export const ChatEmote = memo(ChatEmoteComponent);
