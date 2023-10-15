import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChannelBugClock } from './ChannelBugClock';
import { useSocket } from '../utils/socket-context';
import { EventAlert } from '../EventAlert';
import { useSettings } from '../contexts/settings-context';
import { SettingsPage } from '../model/settings';
import * as styles from '../../scss/modules/ChannelBug.module.scss';

enum ChannelBugScene {
    LINKS = 'channel-bug-links',
    TIME = 'channel-bug-time',
    FOLLOW = 'channel-bug-follow',
    DONATION = 'channel-bug-donation',
}

const sceneOrder = [ChannelBugScene.LINKS, ChannelBugScene.TIME];
const [initialScene, ...initialSceneQueue] = sceneOrder;

const FORCE_NEXT_SCENE = 'next';

const sceneTransitionDurationMs = 500;
const sceneDisplayTimeMap: Record<ChannelBugScene, number> = {
    [ChannelBugScene.LINKS]: 20e3,
    [ChannelBugScene.TIME]: 20e3,
    [ChannelBugScene.FOLLOW]: 8e3,
    [ChannelBugScene.DONATION]: 8e3,
};
const clockSceneVisibleTimeMs = sceneDisplayTimeMap[ChannelBugScene.TIME] + sceneTransitionDurationMs;
const forceSceneSwitchDefault = (): void => {
    throw new Error('forceSceneSwitch is not set');
};

/**
 * @see https://en.wikipedia.org/wiki/Digital_on-screen_graphic
 */
export const ChannelBug: FC = () => {
    const { openSettings } = useSettings();
    const creditsRef = useRef<HTMLDivElement>(null);
    const sceneQueue = useRef<Array<ChannelBugScene>>(initialSceneQueue);
    const forceSceneSwitch = useRef<(to: ChannelBugScene | typeof FORCE_NEXT_SCENE) => void>(forceSceneSwitchDefault);
    const [scene, setScene] = useState(initialScene);
    const socket = useSocket();

    const getNextScene = useCallback(() => {
        const nextScene = sceneQueue.current[0];
        if (sceneQueue.current.length === 1) {
            sceneQueue.current = sceneOrder;
        } else {
            sceneQueue.current = sceneQueue.current.slice(1);
        }
        return nextScene;
    }, []);
    const openChannelBugSettings = useCallback(() => {
        openSettings(SettingsPage.CHANNEL_BUG);
    }, [openSettings]);

    useEffect(() => {
        if (!creditsRef.current) return;
        const creditsEl = creditsRef.current;

        const transitionEffectFrames = [
            { transform: `scale(0,0)` },
            { transform: `scale(1.1,0.05)` },
            { transform: `scale(1,1)`, opacity: 1 },
        ];
        const transitionEffectOptions: KeyframeAnimationOptions = {
            duration: sceneTransitionDurationMs,
            fill: 'forwards',
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
        };
        const appearAnimation = creditsEl.animate(transitionEffectFrames, transitionEffectOptions);
        let disappearAnimation: Animation | undefined;
        let sceneSwitchTimeout: ReturnType<typeof setTimeout> | undefined;
        const sceneDisplayTimeMs = sceneDisplayTimeMap[scene];
        forceSceneSwitch.current = (to) => {
            if (to === scene) return;
            setScene(to === FORCE_NEXT_SCENE ? getNextScene() : to);
        };
        appearAnimation.addEventListener('finish', () => {
            forceSceneSwitch.current = (to) => {
                if (to === scene) return;
                disappearAnimation = creditsEl.animate(transitionEffectFrames.reverse(), transitionEffectOptions);
                disappearAnimation.addEventListener('finish', () => {
                    setScene(to === FORCE_NEXT_SCENE ? getNextScene() : to);
                });
            };
            sceneSwitchTimeout = setTimeout(() => {
                forceSceneSwitch.current(getNextScene());
            }, sceneDisplayTimeMs);
        });

        return () => {
            appearAnimation.cancel();
            disappearAnimation?.cancel();
            clearTimeout(sceneSwitchTimeout);
        };
    }, [getNextScene, scene]);

    useEffect(() => {
        if (!socket) return;

        const followEventListener = () => {
            sceneQueue.current.unshift(scene);
            forceSceneSwitch.current?.(ChannelBugScene.FOLLOW);
        };
        const donationEventListener = () => {
            sceneQueue.current.unshift(scene);
            forceSceneSwitch.current?.(ChannelBugScene.DONATION);
        };
        socket.on('follow', followEventListener);
        socket.on('donation', donationEventListener);

        return () => {
            socket.off('follow', followEventListener);
            socket.off('donation', donationEventListener);
        };
    }, [scene, socket]);

    const sceneJsx = useMemo(() => {
        // noinspection JSUnreachableSwitchBranches
        switch (scene) {
            case ChannelBugScene.LINKS:
                return (
                    <div id={ChannelBugScene.LINKS} hidden={scene !== ChannelBugScene.LINKS}>
                        <img
                            className={styles['logo-image']}
                            src="https://djdavid98.art/logos/djdavid98.svg"
                            alt="DJDavid98"
                        />
                    </div>
                );
            case ChannelBugScene.TIME:
                return (
                    <div id={ChannelBugScene.TIME} hidden={scene !== ChannelBugScene.TIME}>
                        <ChannelBugClock visibleTime={clockSceneVisibleTimeMs} />
                    </div>
                );
            case ChannelBugScene.FOLLOW:
                return (
                    <div id={ChannelBugScene.FOLLOW} hidden={scene !== ChannelBugScene.FOLLOW}>
                        <EventAlert>
                            Thank you for the follow!
                        </EventAlert>;
                    </div>
                );
            case ChannelBugScene.DONATION:
                return (
                    <div id={ChannelBugScene.DONATION} hidden={scene !== ChannelBugScene.DONATION}>
                        <EventAlert>
                            Thank you for your support!
                        </EventAlert>;
                    </div>
                );
        }
    }, [scene]);

    return (
        <div className={styles['channel-bug']} ref={creditsRef} onClick={openChannelBugSettings}>
            {sceneJsx}
        </div>
    );
};
