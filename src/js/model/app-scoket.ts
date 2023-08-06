import type { ChatUserstate } from 'tmi.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { Socket } from 'socket.io-client';

export interface ClientToServerEvents {
    joinRoom: (room: string) => void;
}

export interface ServerToClientEvents {
    chat: (message: ChatWebsocketMessage) => void;
    clearChat: () => void;
    follow: (message: FollowWebsocketMessage) => void;
    donation: (message: DonationWebsocketMessage) => void;
    joinedRoom: (room: string) => void;
    ban: (message: BanWebsocketMessage) => void;
    messageDeleted: (message: MessageDeletedWebsocketMessage) => void;
    connect: () => void;
    disconnect: () => void;
}

export interface FollowWebsocketMessage {
    total?: number;
}

export interface DonationWebsocketMessage {
    from: string;
}

export interface ChatWebsocketMessage {
    name: string;
    username: string;
    message: string;
    pronouns: string[];
    tags: ChatUserstate;
}

export interface BanWebsocketMessage {
    username: string;
    /**
     * Optional details, only if the channel broadcaster is also authenticated with the bot
     */
    detail?: {
        bannedBy?: string;
        reason: string;
        timeout?: number;
    };
}

export interface MessageDeletedWebsocketMessage {
    id: string;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
