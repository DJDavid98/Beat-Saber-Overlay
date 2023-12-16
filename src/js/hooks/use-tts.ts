import { useCallback, useEffect, useRef } from 'react';
import { VoiceData } from '../model/eleven-labs';
import {
    mapPronounsToGender,
    ttsMessageSubstitutions,
    ttsNameSubstitutions,
    VoiceGender
} from '../utils/chat-messages';

interface TtsInput {
    id?: string;
    name?: string;
    message: string;
    pronouns?: string[];
}

export interface TtsApi {
    readText: (input: TtsInput) => Promise<void>;
    clearQueue: VoidFunction;
    clearIds: (ids: string[]) => void;
}

export const useTts = (token: string | null, enabled: boolean | null): TtsApi => {
    const voicesRef = useRef<VoiceData['voices']>([]);
    const mountedRef = useRef(true);
    const textQueueRef = useRef<TtsInput[]>([]);
    const currentlyReadingRef = useRef<TtsInput | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const getVoice = useCallback((targetGender: VoiceGender) => {
        return voicesRef.current.find(voice => {
            const { age, gender, 'use case': useCase } = voice.labels;
            return age === 'young' && gender === targetGender && useCase === 'narration';
        });
    }, []);

    const clearPlayingAudio = useCallback(() => {
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
    }, []);

    const processQueue = useCallback(async (debugSource: string) => {
        if (!enabled) return;

        if (!token) {
            console.error('Token is missing (%s)', debugSource);
            return;
        }
        if (textQueueRef.current.length === 0) {
            console.info('TTS queue is empty (%s)', debugSource);
            return;
        }

        const firstQueueItem = textQueueRef.current[0] as TtsInput;
        const voice = getVoice(mapPronounsToGender(firstQueueItem?.pronouns));
        if (!voice) {
            console.error('No voice found (%s)', debugSource);
            return;
        }
        const { voice_id } = voice;


        if (audioPlayerRef.current) {
            console.info('TTS already playing (%s)', debugSource);
            return;
        }
        audioPlayerRef.current = new Audio();

        const ttsInput = textQueueRef.current.shift() as TtsInput;
        currentlyReadingRef.current = ttsInput;
        const textToRead = (ttsInput.name ? `${ttsNameSubstitutions(ttsInput.name)}. ` : '') + ttsMessageSubstitutions(ttsInput.message);
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': token,
                'accept': 'audio/mpeg'
            },
            body: JSON.stringify({ text: textToRead })
        });
        const audioBlob = await response.blob();

        if (!audioPlayerRef.current) {
            audioPlayerRef.current = new Audio();
        }

        audioPlayerRef.current.src = URL.createObjectURL(audioBlob);
        audioPlayerRef.current.play();
        return new Promise(resolve => {
            audioPlayerRef.current?.addEventListener('ended', () => {
                clearPlayingAudio();
                processQueue('ended handler').then(resolve);
            });
        });
    }, [enabled, token, getVoice, clearPlayingAudio]);

    const readText = useCallback(async (text: TtsInput) => {
        if (!enabled) return;

        textQueueRef.current.push(text);
        void processQueue('readText');
    }, [enabled, processQueue]);

    const clearQueue = useCallback(() => {
        mountedRef.current = false;
        clearPlayingAudio();
    }, [clearPlayingAudio]);

    const clearIds = useCallback((clearedIds: string[]) => {
        if (clearedIds.length === 0) return;

        const clearedIdsSet = new Set(clearedIds);
        if (currentlyReadingRef.current) {
            const currentId = currentlyReadingRef.current?.id;
            if (currentId && clearedIdsSet.has(currentId)) {
                clearPlayingAudio();
            }
        }

        if (textQueueRef.current.length > 0) {
            textQueueRef.current = textQueueRef.current.filter(queueItem => {
                return !queueItem.id || !clearedIdsSet.has(queueItem.id);
            });
        }

        if (!currentlyReadingRef.current) {
            void processQueue('clearIds');
        }
    }, [clearPlayingAudio, processQueue]);

    useEffect(() => {
        if (!enabled || !token || voicesRef.current.length) return;

        fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: { accept: 'application/json' },
        }).then(async (r) => {
            // TODO data validation
            const voiceData = await r.json();
            voicesRef.current = voiceData['voices'];
            void processQueue('voices fetching');
        });
    }, [enabled, processQueue, token]);

    // Clear the queue on unmount
    useEffect(() => {
        if (!enabled) return;

        mountedRef.current = true;
        return clearQueue;
    }, [clearQueue, enabled]);

    return {
        readText,
        clearQueue,
        clearIds,
    };
};
