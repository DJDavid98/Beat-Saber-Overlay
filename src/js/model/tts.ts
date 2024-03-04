import { MutableRefObject } from 'react';

export interface TtsHookOptions {
    token: string | null;
    enabled: boolean | null;
    pickQueueItem: () => TtsInput | null;
    readFirstInQueue: () => TtsInput;
    requestPlayer: (logOnFail?: boolean) => boolean;
    /**
     * @returns promise that resolves when source audio has finished playing
     */
    setAudioSource: (src: string) => Promise<void>;
    clearPlayingAudio: (lastRead?: TtsInput | null) => void;
    clearQueue: VoidFunction;
    clearIdsFromQueue: (clearedIds: string[]) => void;
    queueText: (text: TtsInput) => void;
    lastReadTextRef: MutableRefObject<TtsInput | null>;
    inputQueueRef: MutableRefObject<TtsInput[]>;
    currentlyReadingRef: MutableRefObject<TtsInput | null>;
}

export interface TtsInput {
    id?: string;
    name?: string;
    message: string;
    pronouns?: string[];
}

export interface TtsApi {
    readText: (input: TtsInput) => void;
    clearQueue: VoidFunction;
    /**
     * Function to initiate fetching of the voices for the provider (may use promises internally but shall not return them)
     */
    fetchVoices: VoidFunction;
    clearIds: (ids: string[]) => void;
    limitProviderHook?: TtsLimitProviderHook,
}

export type TtsLimitProviderHook = () => TtsLimits;

export interface TtsLimits {
    maxChars: number;
    usedChars: number;
}

export const enum TtsProvider {
    NOOP = 'NOOP',
    ELEVEN_LABS = 'ElevenLabs',
    PLAY_HT = 'PlayHt',
}


export const isValidTtsProvider = (input: string): input is TtsProvider =>
    input === TtsProvider.ELEVEN_LABS
    || input === TtsProvider.PLAY_HT;
