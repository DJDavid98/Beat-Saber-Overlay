import { ChatWebsocketMessage } from '../model/app-scoket';
import { parseISO, isValid } from 'date-fns';
import { ChatEmoteProps } from '../chat/ChatEmote';

export enum SystemMessageType {
    INFO,
    SUCCESS,
    ERROR,
    FOLLOW,
    DONATION,
}

interface BaseChatMessage {
    id: string;
    timestamp: Date;
    message: string;
}

export interface ChatSystemMessage extends BaseChatMessage {
    type: SystemMessageType;
}

export interface ChatUserMessage extends BaseChatMessage {
    name: string;
    pronouns: string[];
    nameColor: string | undefined;
    messageColor: string | undefined;
    emotes: Record<string, string[]> | undefined;
}

export type DisplayableMessage = ChatUserMessage | ChatSystemMessage;

export const getChatWebsocketMessageTimestamp = (message: ChatWebsocketMessage): Date => {
    const sendTs = message.tags['tmi-sent-ts'];
    if (sendTs) {
        try {
            const parsed = parseISO(sendTs);
            if (isValid(parsed)) {
                return parsed;
            }
        } catch (e) {
            console.error(e);
        }
    }
    return new Date();
};


type MessageToken = string | ChatEmoteProps;
type EmoteRange = { start: number, finish: number, id: string, text: string };

export interface TokenizeMessage {
    tokens: MessageToken[];
    emoteOnly: boolean;
}

export const tokenizeMessage = (
    message: string,
    emotes: ChatUserMessage['emotes']
): TokenizeMessage => {
    const tokens: Array<MessageToken> = [];
    const emoteKeys = typeof emotes === 'object' && emotes !== null ? Object.keys(emotes) : [];
    let emoteOnly = false;
    if (emoteKeys.length > 0) {
        // We have emotes, let's process them
        const normalizedEmoteRanges = emoteKeys.reduce((finalRanges, id) => {
            const emoteRanges = emotes?.[id];
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
                    tokens.push(textBeforeEmote);
                }
            }
            // Push an emote token
            tokens.push(emoteRange);
            lastRangeFinish = emoteRange.finish;
        });
        if (lastRangeFinish < message.length) {
            const finalSubstring = message.substring(lastRangeFinish, message.length);
            if (finalSubstring.length > 0) tokens.push(finalSubstring);
        }

        emoteOnly = tokens.every(token => typeof token !== 'string');
    } else {
        // We don't have emotes, take the full text as-is
        tokens.push(message);
    }
    return { tokens, emoteOnly };
};
