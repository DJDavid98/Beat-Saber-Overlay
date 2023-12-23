import { FC, useMemo } from 'react';
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

    const ttsUsedPercent = limits.maxChars > 0 ? limits.usedChars / limits.maxChars : 1;
    const charsAvailable = limits.maxChars - limits.usedChars;
    const style = useMemo(() => ({ opacity: ttsUsedPercent < .9 ? 0 : 1 }), [ttsUsedPercent]);
    const progressBarStyle = useMemo(() => ({ width: (100 * (1 - ttsUsedPercent)).toFixed(2) + '%' }), [ttsUsedPercent]);

    if (limits.maxChars === 0) return null;

    return <div className={styles['tts-health']} style={style}>
        <label className={styles['tts-label']}>
            <div className={styles['tts-name']}>❤️ TTS Health</div>
            {limits.maxChars > 0 &&
                <div className={styles['tts-percent']}>{nf.format(charsAvailable)} / {nf.format(limits.maxChars)} &bull; {pf.format(1 - ttsUsedPercent)}</div>}
        </label>
        <div className={styles['progress']}>
            <div className={styles['progress-bar']} style={progressBarStyle}></div>
        </div>
    </div>;
};
