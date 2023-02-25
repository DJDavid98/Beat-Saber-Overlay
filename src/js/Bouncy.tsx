import { FC, useCallback, useEffect, useRef } from "react";
import bouncy from '../img/bouncy.webm';
import bouncyBlep from '../img/bouncy-blep.webm';

const HEART_RATE_BLEP_THRESHOLD = 120;
const RESTING_HEART_RATE = 60;

/**
 * Attempts to make a sensible `playbackRate` out of the provided `heartRate` value
 *
 * A "resting" heart rate results in a rate of `1`, reaching the blep threshold is `1.5`,
 * and reaching resting plus the blep threshold is `2`.
 */
const getNewPlaybackRate = (heartRate: number | null): number => {
    if (heartRate !== null && heartRate > 0) {
        return (RESTING_HEART_RATE / HEART_RATE_BLEP_THRESHOLD) + (heartRate / HEART_RATE_BLEP_THRESHOLD);
    }
    return 1;
}

export const Bouncy: FC<{ heartRate: number | null }> = ({ heartRate }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const blepVideoRef = useRef<HTMLVideoElement>(null);

    const logPlaybackRate = useCallback(() => {
        console.info('Playback rates: ', [videoRef.current?.playbackRate, blepVideoRef.current?.playbackRate]);
    }, []);

    const showBlep = heartRate !== null && heartRate > HEART_RATE_BLEP_THRESHOLD;

    useEffect(() => {
        const newPlaybackRate = getNewPlaybackRate(heartRate);
        if (videoRef.current) {
            videoRef.current.playbackRate = newPlaybackRate;
        }
        if (blepVideoRef.current) {
            blepVideoRef.current.playbackRate = newPlaybackRate
        }
    }, [heartRate]);

    return (
        <>
            <video
                id="bouncy-video"
                loop
                autoPlay
                preload="auto"
                muted
                ref={videoRef}
                className={showBlep ? undefined : 'show'}
                onClick={logPlaybackRate}
            >
                <source type="video/webm" src={bouncy} />
            </video>
            <video
                id="bouncy-video-blep"
                loop
                autoPlay
                preload="auto"
                muted
                ref={blepVideoRef}
                className={showBlep ? 'show' : undefined}
                onClick={logPlaybackRate}
            >
                <source type="video/webm" src={bouncyBlep} />
            </video>
        </>
    )
};
