import {
    AudioPlayerRequestResult,
    CancellableTtsInput,
    TtsApi,
    TtsInput,
    TtsProvider
} from '../model/tts';
import { SettingName } from '../model/settings';
import { useSettings } from '../contexts/settings-context';
import { useElevenLabsTts } from './use-eleven-labs-tts';
import { usePlayHtTts } from './use-play-ht-tts';
import { useCallback, useEffect, useMemo, useRef } from 'react';

const noopTts: TtsApi = {
    clearIds: () => undefined,
    clearQueue: () => undefined,
    fetchVoices: () => undefined,
    readText: () => Promise.resolve(),
};

export const useTts = (): TtsApi => {
    const {
        settings: {
            [SettingName.ELEVEN_LABS_TOKEN]: elevenLabsToken,
            [SettingName.TTS_ENABLED]: ttsEnabled,
            [SettingName.PLAY_HT_TOKEN]: playHtToken,
            [SettingName.PLAY_HT_USER_ID]: playHtUserId,
            [SettingName.TTS_PROVIDER]: ttsProvider,
        }
    } = useSettings();
    const lastReadTextRef = useRef<CancellableTtsInput | null>(null);

    const mountedRef = useRef(true);
    const inputQueueRef = useRef<CancellableTtsInput[]>([]);
    const currentlyReadingRef = useRef<CancellableTtsInput | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    const pickQueueItem = useCallback(() => {
        if (inputQueueRef.current.length === 0) {
            console.info('TTS queue is empty');
            return null;
        }

        return inputQueueRef.current[0] as CancellableTtsInput;
    }, []);

    const requestPlayer = (): AudioPlayerRequestResult => {
        if (audioPlayerRef.current) {
            console.info('TTS already playing');
            return null;
        }
        audioPlayerRef.current = new Audio();
        return audioPlayerRef.current;
    };

    const takeAndReadFirstInQueue = () => {
        const ttsInput = inputQueueRef.current.shift() as CancellableTtsInput;
        currentlyReadingRef.current = ttsInput;
        return ttsInput;
    };
    const playThroughAudio = async (player: HTMLAudioElement, src: string,
        ttsInput: CancellableTtsInput) => {
        player.src = src;
        void player.play();

        return new Promise<void>(resolve => {
            const handleAbort = () => {
                player.pause();
                resolve();
            };

            if (ttsInput.abortSignal.aborted) {
                handleAbort();
                return;
            }

            ttsInput.abortSignal.addEventListener('abort', handleAbort);

            player.addEventListener('ended', () => {
                resolve();
            });
        });
    };

    const clearPlayingAudio = useCallback((lastRead: CancellableTtsInput | null = null) => {
        if (currentlyReadingRef.current) {
            currentlyReadingRef.current.abort();
            currentlyReadingRef.current = null;
        }
        if (audioPlayerRef.current) {
            if (!audioPlayerRef.current.paused) {
                audioPlayerRef.current.pause();
            }
            const currentSource = audioPlayerRef.current.src;
            if (currentSource) {
                URL.revokeObjectURL(currentSource);
            }
            audioPlayerRef.current = null;
        }
        lastReadTextRef.current = lastRead;
    }, [audioPlayerRef, currentlyReadingRef, lastReadTextRef]);

    const clearQueue = useCallback(() => {
        mountedRef.current = false;
        clearPlayingAudio();
        inputQueueRef.current = [];
    }, [clearPlayingAudio, mountedRef]);

    const clearIdsFromQueue = useCallback((clearedIds: string[]) => {
        if (clearedIds.length === 0) return;

        const clearedIdsSet = new Set(clearedIds);
        if (currentlyReadingRef.current) {
            const currentId = currentlyReadingRef.current?.id;
            if (currentId && clearedIdsSet.has(currentId)) {
                clearPlayingAudio();
            }
        }

        if (inputQueueRef.current.length > 0) {
            inputQueueRef.current = inputQueueRef.current.filter(queueItem => {
                const keep = !queueItem.id || !clearedIdsSet.has(queueItem.id);
                if (!keep) {
                    queueItem.abort('clearIdsFromQueue');
                }

                return keep;
            });
        }
    }, [clearPlayingAudio]);

    const queueText = useCallback((text: TtsInput) => {
        const abortController = new AbortController();
        inputQueueRef.current.push({
            ...text,
            abort: (reason?: string) => abortController.abort(reason),
            abortSignal: abortController.signal,
        });
    }, [inputQueueRef]);

    const elevenLabsTts = useElevenLabsTts({
        token: elevenLabsToken,
        enabled: ttsEnabled && ttsProvider === TtsProvider.ELEVEN_LABS,
        lastReadTextRef,
        currentlyReadingRef,
        inputQueueRef,
        pickQueueItem,
        requestPlayer,
        takeAndReadFirstInQueue,
        playThroughAudio,
        clearPlayingAudio,
        clearQueue,
        clearIdsFromQueue,
        queueText,
    });
    const playHtTts = usePlayHtTts({
        token: playHtToken,
        userId: playHtUserId,
        enabled: ttsEnabled && ttsProvider === TtsProvider.PLAY_HT,
        lastReadTextRef,
        currentlyReadingRef,
        inputQueueRef,
        pickQueueItem,
        requestPlayer,
        takeAndReadFirstInQueue,
        playThroughAudio,
        clearPlayingAudio,
        clearQueue,
        clearIdsFromQueue,
        queueText,
    });

    const chosenApi = useMemo(() => {
        if (ttsEnabled) {
            switch (ttsProvider) {
                case TtsProvider.PLAY_HT:
                    return playHtTts;
                case TtsProvider.ELEVEN_LABS:
                    return elevenLabsTts;
            }
        }
        return noopTts;
    }, [elevenLabsTts, ttsEnabled, playHtTts, ttsProvider]);

    useEffect(() => {
        chosenApi.fetchVoices();
    }, [chosenApi]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            // Clear the queue on unmount
            chosenApi.clearQueue();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mountedRef]);

    return chosenApi;
};
