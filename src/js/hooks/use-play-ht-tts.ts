import { useCallback, useMemo, useRef } from 'react';
import { TtsApi, TtsHookOptions, TtsInput } from '../model/tts';
import { mapPronounsToGender, ttsInputToText } from '../utils/chat-messages';
import { PlayHtVoiceData } from '../model/play-ht';

export interface PlayHtTtsParams extends TtsHookOptions {
    userId: string | null;
}

export const usePlayHtTts = ({
    token,
    enabled,
    userId,
    lastReadTextRef,
    requestPlayer,
    playThroughAudio,
    takeAndReadFirstInQueue,
    pickQueueItem,
    clearQueue,
    clearIdsFromQueue,
    queueText,
}: PlayHtTtsParams): TtsApi => {
    const voicesRef = useRef<PlayHtVoiceData[]>([]);
    const getVoiceId = useCallback((ttsInput?: TtsInput): string | undefined => {
        const targetGender = mapPronounsToGender(ttsInput?.pronouns);
        const matchingVoice = voicesRef.current.find(voice => {
            const { age, gender, style, loudness } = voice;
            return age === 'youth' && gender === targetGender && style === 'narrative' && loudness === 'neutral';
        });
        return matchingVoice ? matchingVoice.id : undefined;
    }, []);
    const apiAuthHeaders = useMemo(() => {
        const authHeaders: Record<string, string> = {};
        if (token) authHeaders['Authorization'] = token;
        if (userId) authHeaders['X-USER-ID'] = userId;
        return authHeaders;
    }, [token, userId]);

    const processQueue = useCallback(async (debugSource: string): Promise<void> => {
        if (!enabled) return;

        if (!token) {
            console.error('Token is missing (%s)', debugSource);
            return;
        }

        if (!userId) {
            console.error('User ID is missing (%s)', debugSource);
            return;
        }

        const firstQueueItem = pickQueueItem();
        if (!firstQueueItem) {
            return;
        }

        const voiceId = getVoiceId(firstQueueItem);
        if (!voiceId) {
            console.error('No voice found (%s)', debugSource);
            return;
        }

        const player = requestPlayer();
        if (!player) {
            return;
        }

        const ttsInput = takeAndReadFirstInQueue();
        const textToRead = ttsInputToText(ttsInput, lastReadTextRef.current);
        try {
            // Make API request to Play.ht (adjust URL and headers)
            const response = await fetch('https://api.play.ht/api/v2/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg',
                    ...apiAuthHeaders,
                },
                body: JSON.stringify({
                    text: textToRead,
                    voice: getVoiceId(ttsInput),
                    output_format: 'mp3',
                    speed: 1,
                    sample_rate: 44100,
                    voice_engine: 'PlayHT2.0-turbo'
                }),
            });

            const audioUrl = response.ok ? response.headers.get('Location') : undefined;
            if (!audioUrl) {
                throw new Error(response.statusText);
            }

            return playThroughAudio(player, audioUrl, ttsInput);
        } catch (error) {
            console.error('Error generating audio:', error);
        }
    }, [apiAuthHeaders, enabled, getVoiceId, lastReadTextRef, pickQueueItem, takeAndReadFirstInQueue, requestPlayer, playThroughAudio, token, userId]);

    const fetchVoices = useCallback(() => {
        if (!enabled || !token || voicesRef.current.length) return;

        fetch('https://api.play.ht/api/v2/voices', {
            method: 'GET',
            headers: { accept: 'application/json', ...apiAuthHeaders },
        }).then(async (r) => {
            // TODO data validation
            voicesRef.current = await r.json();
            void processQueue('voices fetching');
        });
    }, [apiAuthHeaders, enabled, processQueue, token]);

    const readText = useCallback((text: TtsInput) => {
        if (!enabled) return;

        queueText(text);
        void processQueue('readText');
    }, [enabled, queueText, processQueue]);

    return {
        readText,
        fetchVoices,
        clearQueue,
        clearIds: clearIdsFromQueue,
    };
};
