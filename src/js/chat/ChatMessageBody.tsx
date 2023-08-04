import { FC, memo } from 'react';
import { ChatWebsocketMessage } from '../model/app-scoket';
import { ChatEmote, ChatEmoteProps } from './ChatEmote';

type MessageToken = string | ChatEmoteProps;
type EmoteRange = { start: number, finish: number, id: string, text: string }

const ChatMessageBodyComponent: FC<Pick<ChatWebsocketMessage, 'message' | 'tags'>> = ({
    message,
    tags
}) => {
    const tokenizedMessage: Array<MessageToken> = [];
    const emoteKeys = typeof tags.emotes === 'object' && tags.emotes !== null ? Object.keys(tags.emotes) : [];
    let emoteOnly = false;
    if (emoteKeys.length > 0) {
        // We have emotes, let's process them
        const normalizedEmoteRanges = emoteKeys.reduce((finalRanges, id) => {
            const emoteRanges = tags.emotes?.[id];
            if (emoteRanges) {
                emoteRanges.forEach(rangeSpecifier => {
                    const range = rangeSpecifier.split('-').map(Number);
                    const start = range[0];
                    const finish = range[1] + 1;
                    const text = message.substring(start, finish);
                    finalRanges.push({ start, finish, id, text });
                });
            }
            return finalRanges;
        }, [] as EmoteRange[]).sort(({ start: startA }, { start: startB }) => startA - startB);

        let lastRangeFinish = 0;
        // For every range
        normalizedEmoteRanges.forEach(emoteRange => {
            if (emoteRange.start > lastRangeFinish) {
                const textBeforeEmote = message.substring(lastRangeFinish, emoteRange.start);
                if (textBeforeEmote.length > 0) {
                    tokenizedMessage.push(textBeforeEmote);
                }
            }
            // Push an emote token
            tokenizedMessage.push(emoteRange);
            lastRangeFinish = emoteRange.finish;
        });
        if (lastRangeFinish < message.length) {
            const finalSubstring = message.substring(lastRangeFinish, message.length);
            if (finalSubstring.length > 0) tokenizedMessage.push(finalSubstring);
        }

        emoteOnly = tokenizedMessage.every(token => typeof token !== 'string');
    } else {
        // We don't have emotes, take the full text as-is
        tokenizedMessage.push(message);
    }

    return <div className="chat-message-body">{tokenizedMessage.map(token => {
        if (typeof token !== 'string')
            return <ChatEmote {...token} large={emoteOnly} />;

        return <>{token}</>;
    })}</div>;
};

export const ChatMessageBody = memo(ChatMessageBodyComponent);
