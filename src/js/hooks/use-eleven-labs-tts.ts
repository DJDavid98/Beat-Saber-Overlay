import { useCallback, useMemo, useRef } from 'react';
import { ElevenLabsVoiceData } from '../model/eleven-labs';
import { mapPronounsToGender, ttsInputToText } from '../utils/chat-messages';
import useSWR, { useSWRConfig } from 'swr';
import { ELEVEN_LABS_SUBSCRIPTION_ENDPOINT } from '../chat/TtsHealth';
import { TtsApi, TtsHookOptions, TtsInput, TtsLimits } from '../model/tts';
import { useSettings } from '../contexts/settings-context';
import { SettingName } from '../model/settings';

const useElevenLabsLimits = (): TtsLimits => {
    const { settings: { [SettingName.ELEVEN_LABS_TOKEN]: token } } = useSettings();

    const { data: subscriptionData } = useSWR(ELEVEN_LABS_SUBSCRIPTION_ENDPOINT, async (key: string) => {
        if (!token) {
            return null;
        }

        const r = await fetch(key, {
            method: 'GET',
            headers: {
                'xi-api-key': token,
            },
        });
        return await r.json();
    }, {
        refreshInterval: 60e3,
        revalidateOnFocus: false,
        keepPreviousData: true,
    });

    return useMemo((): TtsLimits => {
        let maxChars = 0;
        let usedChars = 0;
        if (typeof subscriptionData === 'object' && subscriptionData !== null) {
            if ('character_limit' in subscriptionData && typeof subscriptionData.character_limit === 'number') {
                maxChars = subscriptionData.character_limit;
            }
            if ('character_count' in subscriptionData && typeof subscriptionData.character_count === 'number') {
                usedChars = subscriptionData.character_count;
            }
        }
        return { maxChars, usedChars };
    }, [subscriptionData]);
};

export const useElevenLabsTts = ({
    token,
    enabled,
    lastReadTextRef,
    currentlyReadingRef,
    pickQueueItem,
    requestPlayer,
    readFirstInQueue,
    setAudioSource,
    clearPlayingAudio,
    clearQueue,
    clearIdsFromQueue,
    queueText,
}: TtsHookOptions): TtsApi => {
    const voicesRef = useRef<ElevenLabsVoiceData['voices']>([]);
    const getVoiceId = useCallback((ttsInput?: TtsInput): string | undefined => {
        const targetGender = mapPronounsToGender(ttsInput?.pronouns);
        const matchingVoice = voicesRef.current.find(voice => {
            const { age, gender, 'use case': useCase } = voice.labels;
            return age === 'young' && gender === targetGender && useCase === 'narration';
        });
        return matchingVoice ? matchingVoice.voice_id : undefined;
    }, []);

    const { mutate } = useSWRConfig();

    const processQueue = useCallback(async (debugSource: string): Promise<void> => {
        if (!enabled) return;

        if (!token) {
            console.error('Token is missing (%s)', debugSource);
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

        if (!requestPlayer()) {
            return;
        }

        const ttsInput = readFirstInQueue();
        const textToRead = ttsInputToText(ttsInput, lastReadTextRef.current);
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': token,
                'accept': 'audio/mpeg'
            },
            body: JSON.stringify({ text: textToRead })
        });
        const audioBlob = await response.blob();
        void mutate(ELEVEN_LABS_SUBSCRIPTION_ENDPOINT);

        return setAudioSource(URL.createObjectURL(audioBlob)).then(() => {
            clearPlayingAudio(ttsInput);
            return processQueue('ended handler');
        });
    }, [clearPlayingAudio, enabled, getVoiceId, lastReadTextRef, mutate, pickQueueItem, readFirstInQueue, requestPlayer, setAudioSource, token]);

    const readText = useCallback((text: TtsInput) => {
        if (!enabled) return;

        queueText(text);
        void processQueue('readText');
    }, [enabled, queueText, processQueue]);

    const clearIds = useCallback((clearedIds: string[]) => {
        clearIdsFromQueue(clearedIds);

        if (!currentlyReadingRef.current) {
            void processQueue('clearIds');
        }
    }, [clearIdsFromQueue, currentlyReadingRef, processQueue]);

    const fetchVoices = useCallback(() => {
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

    return {
        readText,
        fetchVoices,
        clearQueue,
        clearIds,
        limitProviderHook: useElevenLabsLimits,
    };
};
