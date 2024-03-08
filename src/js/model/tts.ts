import { MutableRefObject } from 'react';

export type AudioPlayerRequestResult = HTMLAudioElement | null;

export interface TtsHookOptions {
    token: string | null;
    enabled: boolean | null;
    pickQueueItem: () => CancellableTtsInput | null;
    takeAndReadFirstInQueue: () => CancellableTtsInput;
    requestPlayer: (logOnFail?: boolean) => AudioPlayerRequestResult;
    /**
     * @returns promise that resolves when source audio has finished playing
     */
    playThroughAudio: (element: HTMLAudioElement, src: string,
        ttsInput: CancellableTtsInput) => Promise<void>;
    clearPlayingAudio: (lastRead?: CancellableTtsInput | null) => void;
    clearQueue: VoidFunction;
    clearIdsFromQueue: (clearedIds: string[]) => void;
    queueText: (text: TtsInput) => void;
    lastReadTextRef: MutableRefObject<CancellableTtsInput | null>;
    inputQueueRef: MutableRefObject<CancellableTtsInput[]>;
    currentlyReadingRef: MutableRefObject<CancellableTtsInput | null>;
}

export interface TtsInput {
    id?: string;
    name?: string;
    message: string;
    pronouns?: string[];
}

export interface CancellableTtsInput extends TtsInput {
    abortSignal: AbortSignal;
    abort: (reason?: string) => void;
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
