import { FC, useCallback, useEffect, useRef } from 'react';
import bouncy from '../img/bouncy.webm';
import bouncyBlep from '../img/bouncy-blep.webm';
import { useSettings } from './contexts/settings-context';
import { SettingsPage } from './model/settings';
import classNames from 'classnames';
import * as styles from '../scss/modules/Bouncy.module.scss';

const HEART_RATE_BLEP_THRESHOLD = 120;
const RESTING_HEART_RATE = 60;
const INITIAL_PLAYBACK_RATE_OFFSET = -0.5;

/**
 * Attempts to make a sensible `playbackRate` out of the provided `heartRate` value
 *
 * A "resting" heart rate results in a rate of `1`, reaching the blep threshold is `1.5`,
 * and reaching resting plus the blep threshold is `2`.
 */
const getNewPlaybackRate = (heartRate: number | null): number => {
    if (heartRate !== null && heartRate > 0) {
        return INITIAL_PLAYBACK_RATE_OFFSET + (RESTING_HEART_RATE / HEART_RATE_BLEP_THRESHOLD) + (heartRate / HEART_RATE_BLEP_THRESHOLD);
    }
    return 1;
};

export const Bouncy: FC<{ heartRate: number | null }> = ({ heartRate }) => {
    const { openSettings } = useSettings();
    const videoRef = useRef<HTMLVideoElement>(null);
    const blepVideoRef = useRef<HTMLVideoElement>(null);

    const showBlep = heartRate !== null && heartRate > HEART_RATE_BLEP_THRESHOLD;

    const openBouncySettings = useCallback(() => {
        openSettings(SettingsPage.BOUNCY);
    }, [openSettings]);

    useEffect(() => {
        const newPlaybackRate = getNewPlaybackRate(heartRate);
        if (videoRef.current) {
            videoRef.current.playbackRate = newPlaybackRate;
        }
        if (blepVideoRef.current) {
            blepVideoRef.current.playbackRate = newPlaybackRate;
        }
    }, [heartRate]);

    return (
        <>
            <video
                loop
                autoPlay
                preload="auto"
                muted
                ref={videoRef}
                className={classNames(styles['bouncy'], { [styles['show']]: !showBlep })}
                onClick={openBouncySettings}
            >
                <source type="video/webm" src={bouncy} />
            </video>
            <video
                loop
                autoPlay
                preload="auto"
                muted
                ref={blepVideoRef}
                className={classNames(styles['bouncy'], { [styles['show']]: showBlep })}
                onClick={openBouncySettings}
            >
                <source type="video/webm" src={bouncyBlep} />
            </video>
        </>
    );
};
