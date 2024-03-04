import { TtsApi, TtsInput, TtsProvider } from '../model/tts';
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
    const lastReadTextRef = useRef<TtsInput | null>(null);

    const mountedRef = useRef(true);
    const inputQueueRef = useRef<TtsInput[]>([]);
    const currentlyReadingRef = useRef<TtsInput | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    const pickQueueItem = useCallback(() => {
        if (inputQueueRef.current.length === 0) {
            console.info('TTS queue is empty');
            return null;
        }

        return inputQueueRef.current[0] as TtsInput;
    }, []);

    const requestPlayer = (): boolean => {
        if (audioPlayerRef.current) {
            console.info('TTS already playing');
            return false;
        }
        audioPlayerRef.current = new Audio();
        return true;
    };

    const readFirstInQueue = () => {
        const ttsInput = inputQueueRef.current.shift() as TtsInput;
        currentlyReadingRef.current = ttsInput;
        return ttsInput;
    };
    const setAudioSource = async (src: string) => {
        if (!audioPlayerRef.current) {
            audioPlayerRef.current = new Audio();
        }

        audioPlayerRef.current.src = src;
        audioPlayerRef.current.play();

        return new Promise<void>(resolve => {
            audioPlayerRef.current?.addEventListener('ended', () => {
                resolve();
            });
        });
    };

    const clearPlayingAudio = useCallback((lastRead: TtsInput | null = null) => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            const currentSource = audioPlayerRef.current.src;
            if (currentSource) {
                URL.revokeObjectURL(currentSource);
            }
            audioPlayerRef.current = null;
        }
        if (currentlyReadingRef.current) {
            currentlyReadingRef.current = null;
        }
        lastReadTextRef.current = lastRead;
    }, [audioPlayerRef, currentlyReadingRef, lastReadTextRef]);

    const clearQueue = useCallback(() => {
        mountedRef.current = false;
        clearPlayingAudio();
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
                return !queueItem.id || !clearedIdsSet.has(queueItem.id);
            });
        }
    }, [clearPlayingAudio]);


    const queueText = useCallback((text: TtsInput) => {
        inputQueueRef.current.push(text);
    }, [inputQueueRef]);

    const elevenLabsTts = useElevenLabsTts({
        token: elevenLabsToken,
        enabled: ttsEnabled && ttsProvider === TtsProvider.ELEVEN_LABS,
        lastReadTextRef,
        currentlyReadingRef,
        inputQueueRef,
        pickQueueItem,
        requestPlayer,
        readFirstInQueue,
        setAudioSource,
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
        readFirstInQueue,
        setAudioSource,
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
        mountedRef.current = true;
        chosenApi.fetchVoices();
        // Clear the queue on unmount
        return chosenApi.clearQueue;
    }, [chosenApi, mountedRef]);

    return chosenApi;
};
