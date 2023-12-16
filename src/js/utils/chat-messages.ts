import { ChatWebsocketMessage } from '../model/app-scoket';
import { isValid, parseISO } from 'date-fns';
import { ChatEmoteProps } from '../chat/ChatEmote';
import { BeatSaverMapProps } from '../BeatSaverMap';

export enum SystemMessageType {
    INFO,
    SUCCESS,
    ERROR,
    WARN,
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

export interface ChatUserMessage extends BaseChatMessage, TokenizeMessage {
    name: string;
    username: string;
    pronouns: string[];
    nameColor: string | undefined;
    messageColor: string | undefined;
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

const bsrPattern = /^!bsr\s+([a-f\d]+)(?:\s+|$)/;
export const isSongRequest = (message: string) => bsrPattern.test(message);

type MessageToken = string | ChatEmoteProps | BeatSaverMapProps;
type EmoteRange = { start: number, finish: number, id: string, text: string };

export interface TokenizeMessage {
    tokens: MessageToken[];
    emoteOnly: boolean;
}

export const tokenizeMessage = (
    message: string,
    emotes: Record<string, string[]> | undefined,
): TokenizeMessage => {
    const tokens: Array<MessageToken> = [];
    const bsrMatch = message.match(bsrPattern);
    const bsrPrefixLength = bsrMatch ? bsrMatch[0].length : 0;

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

        let lastRangeFinish = bsrPrefixLength;
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
        tokens.push(bsrPrefixLength ? message.substring(bsrPrefixLength) : message);
    }
    if (bsrMatch) {
        const [, mapId] = bsrMatch;
        tokens.push({ mapId, text: `(song request, ${mapId})` });
    }
    return { tokens, emoteOnly };
};

const emoteTextReadAloud: Record<string, string> = {
    Kappa: 'kappa',
    LUL: 'lawl',
    NotLikeThis: 'not like this',
    SeemsGood: 'thumbs up',
    WutFace: 'whut',
    ResidentSleeper: 'falls asleep',
    HeyGuys: 'hey',
    PJSalt: 'salt',
    PJSugar: 'sugar',
    Kreygasm: 'ooouuuaahhh',
    thebla273Pet: 'pets',
    DoritosChip: 'Doritos',
    VoteNay: 'votes with nay',
    VoteYea: 'votes with yea',
    imGlitch: 'Twitch logo',
    TheIlluminati: 'illuminati',
    PopCorn: 'popcorn',
    VirtualHug: 'virtual hug',
    ImTyping: 'typing',
    PizzaTime: 'pizza time',
};

export const removeEmotes = (tokens: Array<MessageToken>): string => tokens
    .reduce((output: string[], token) => {
        if (typeof token === 'string') {
            return [...output, token];
        }
        if ('text' in token && typeof token.text === 'string') {
            if ('mapId' in token) {
                return [...output, token.text];
            } else if (token.text in emoteTextReadAloud) {
                return [...output, `(${emoteTextReadAloud[token.text]})`];
            }
        }
        return output;
    }, [])
    .join(' ');

export const ttsNameSubstitutions = (input: string): string => {
    let output = input;
    const isAllUppercase = output.toUpperCase() === output;
    if (isAllUppercase) {
        output = output.toLowerCase();
    }

    return output
        .replace(/[._-]/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/(\d{4,})/g, '')
        .replace(/(\d{1,3})/g, ' $1 ')
        .trim()
        .replace(/\s+/, ' ');
};

export const ttsMessageSubstitutions = (input: string): string =>
    input
        .replace(/\b(?:gm)+\b/g, (match) => match.replace(/gm/g, 'good morning ').trim())
        .replace(/\b(?:ni)+\b/g, 'good night')
        .replace(/\bbby\b/g, 'baby')
        .replace(/\bbb\b/g, 'bye bye')
        .replace(/\bg[2t]g\b/gi, 'gotta go')
        .replace(/\bcya\b/gi, 'see ya')
        .replace(/\bwtf\b/gi, 'what the fuck')
        .replace(/\bbrb\b/gi, 'be right back')
        .replace(/\biou\b/gi, 'i owe you')
        .replace(/\bl8r\b/g, 'later')
        .replace(/\batm\b/g, 'at the moment')
        .replace(/\bw\/e\b/g, 'whatever')
        .replace(/\btxt\b/gi, 'text')
        .replace(/\broflmao\b/gi, 'rolling on the floor laughing my ass off')
        .replace(/\broflol\b/gi, 'rolling on the floor laughing out loud')
        .replace(/\blol\b/gi, 'laughing out loud')
        .replace(/\blmfao\b/gi, 'laughing my fuckin\' ass off')
        .replace(/\blmao\b/gi, 'laughing my ass off')
        .replace(/\bwip\b/gi, 'work-in-progress')
        .replace(/\bsup\b/gi, "what's up")
        .replace(/\bhru\b/gi, 'how are you')
        .replace(/\bggwp\b/gi, 'good game, well played')
        .replace(/\bgg(s)?\b/gi, 'good game$1')
        .replace(/\bez\b/gi, 'easy')
        .replace(/\bwp\b/gi, 'well played')
        .replace(/\bkk\b/gi, 'okay')
        .replace(/\bm8(s)?\b/gi, 'mate$1')
        .replace(/\bwyd(\?)?\b/gi, 'what are you doing$1')
        .replace(/\bhyd(\?)?\b/gi, 'how are you doing$1')
        .replace(/\bwd?ym(\?)?\b/gi, 'what do you mean$1')
        .replace(/\bnm\b/gi, 'not much')
        .replace(/\bnp\b/gi, 'no problem')
        .replace(/\byw\b/gi, "you're welcome")
        .replace(/\bbs(?:\+\b|\splus\b)/gi, 'beat saber plus')
        .replace(/\bnjs\b/gi, 'note jump speed')
        .replace(/\bjd\b/gi, 'jump distance')
        .replace(/\bnjd\b/gi, 'note jump distance')
        .replace(/\bpb\b/gi, 'personal best')
        .replace(/\bpbj\b/gi, 'peanut butter jelly')
        .replace(/\bbs\b/gi, 'bullshit')
        .replace(/\bsrs(ly)?(\?)?\b/gi, 'serious$1$2')
        .replace(/\b(>)?:3\b/gi, (_, evil) => `${evil ? 'evil ' : ''}cat face`)
        .replace(/\b(>)?:\)\b/g, (_, evil) => `${evil ? 'evil ' : ''}smiling face`)
        .replace(/\b[(C]:(<)?\b/gi, (_, evil) => `backwards ${evil ? 'evil ' : ''}smiling face`)
        .replace(/\b(>)?:[(c<]\b/gi, (_, evil) => `${evil ? 'evil ' : ''}sad face`)
        .replace(/\b>\.<["']?:\b/gi, 'annoyed face')
        .replace(/\b>\/+<["']?:\b/gi, 'embarrassed face')
        .replace(/\bkbd?\b/gi, 'keyboard')
        .replace(/\bog\b/gi, 'original')
        .replace(/\bop\b/gi, 'overpowered')
        .replace(/\bpl(?:[sz]|0x)\b/gi, 'please')
        .replace(/\bltt\b/gi, 'Linus Tech Tips')
        .replace(/\bk\/?d\/?r\b/gi, 'kill-death ratio')
        .replace(/\bk\/?d\b/gi, 'kill-death')
        .replace(/\bf2p\b/gi, 'free-to-play')
        .replace(/\b\/s\b/gi, '(sarcastically)')
        .replace(/\b\/gen\b/gi, '(genuinely)')
        .replace(/\bo7\b/gi, '(salute)')
        .replace(/\b¯\\_\(ツ\)_\/¯\b/gi, '(shrugs)')
        .replace(/\b\(╯°□°\)╯︵ ┻━┻\b/gi, '(flips table)')
        .replace(/\b┬─┬ノ\( º _ ºノ\)\b/gi, '(un-flips table)');

const messageTypeColorMap: Record<SystemMessageType, string> = {
    [SystemMessageType.INFO]: '#aaaaaa',
    [SystemMessageType.SUCCESS]: '#aaffaa',
    [SystemMessageType.ERROR]: '#ffaaaa',
    [SystemMessageType.WARN]: '#ffdd00',
    [SystemMessageType.FOLLOW]: '#7ba6f2',
    [SystemMessageType.DONATION]: '#ccaa00',
};

export const accentColorCssVariable = '--accent-color';
export const accentColor80CssVariable = '--accent-color-80';
export const accentColor20CssVariable = '--accent-color-20';

export const getAccentColor = (message: ChatUserMessage | ChatSystemMessage) => {
    if ('type' in message) {
        return messageTypeColorMap[message.type];
    }

    return message.nameColor;
};


export type VoiceGender = 'male' | 'female';

export const mapPronounsToGender = (pronouns?: string[]): VoiceGender => {
    const firstPronoun = pronouns?.[0];
    switch (firstPronoun) {
        case 'She/Her':
        case 'She/They':
            return 'female';
        default:
            return 'male';
    }
};
