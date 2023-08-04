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
    follow: () => void;
    donation: (message: DonationWebsocketMessage) => void;
}

export interface DonationWebsocketMessage {
    from: string;
}

export interface ChatWebsocketMessage {
    name: string;
    message: string;
    pronouns: string | null;
    tags: ChatUserstate;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
