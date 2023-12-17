import { FC, useId, useMemo } from 'react';
import useSWR from 'swr';
import * as styles from '../../scss/modules/TtsHealth.module.scss';

export const ELEVEN_LABS_SUBSCRIPTION_ENDPOINT = 'https://api.elevenlabs.io/v1/user/subscription';

export interface TtsHealthProps {
    token: string;
}

export const TtsHealth: FC<TtsHealthProps> = ({ token }) => {
    const pf = useMemo(() => new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }), []);
    const nf = useMemo(() => new Intl.NumberFormat('en-US'), []);
    const progressBarId = useId();

    const { data: subscriptionData } = useSWR(ELEVEN_LABS_SUBSCRIPTION_ENDPOINT, (key: string) => fetch(key, {
        method: 'GET',
        headers: {
            'xi-api-key': token,
        },
    }).then(r => r.json()), {
        refreshInterval: 60e3,
        revalidateOnFocus: false,
        keepPreviousData: true,
    });

    const limits = useMemo(() => {
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

    if (limits.maxChars === 0) return null;

    const charsAvailable = limits.maxChars - limits.usedChars;

    return <div className={styles['tts-health']}>
        <label htmlFor={progressBarId} className={styles['tts-label']}>
            <div className={styles['tts-name']}>❤️ TTS Health</div>
            {limits.maxChars > 0 &&
                <div className={styles['tts-percent']}>{nf.format(charsAvailable)} / {nf.format(limits.maxChars)} &bull; {pf.format(1 - limits.usedChars / limits.maxChars)}</div>}
        </label>
        <progress
            id={progressBarId}
            max={limits.maxChars}
            value={charsAvailable}
        />
    </div>;
};
