import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CreditsClock } from './CreditsClock';
import { CreditsFollow } from './CreditsFollow';
import { useSocket } from '../utils/socket-context';

enum CreditsScene {
    LINKS = 'credits-links',
    TIME = 'credits-time',
    FOLLOW = 'credits-follow',
}

const sceneOrder = [CreditsScene.LINKS, CreditsScene.TIME];
const [initialScene, ...initialSceneQueue] = sceneOrder;

const FORCE_NEXT_SCENE = 'next';

const sceneTransitionDurationMs = 500;
const sceneDisplayTimeMap: Record<CreditsScene, number> = {
    [CreditsScene.LINKS]: 45e3,
    [CreditsScene.TIME]: 15e3,
    [CreditsScene.FOLLOW]: 8e3,
};
const clockSceneVisibleTimeMs = sceneDisplayTimeMap[CreditsScene.TIME] + sceneTransitionDurationMs;

export const Credits: FC = () => {
    const creditsRef = useRef<HTMLDivElement>(null);
    const sceneQueue = useRef<Array<CreditsScene>>(initialSceneQueue);
    const forceSceneSwitch = useRef<(to: CreditsScene | typeof FORCE_NEXT_SCENE) => void>(() => undefined);
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
            forceSceneSwitch.current?.(CreditsScene.FOLLOW);
        };
        socket.on('follow', followEventListener);

        return () => {
            socket.off('follow', followEventListener);
        };
    }, [scene, socket]);

    const sceneJsx = useMemo(() => {
        switch (scene) {
            case CreditsScene.LINKS:
                return (
                    <div id={CreditsScene.LINKS} hidden={scene !== CreditsScene.LINKS}>
                        <a href="https://djdavid98.art" target="_blank" rel="noopener noreferrer">
                            <img src="https://djdavid98.art/logos/djdavid98.svg" alt="DJDavid98" />
                        </a>
                    </div>
                );
            case CreditsScene.TIME:
                return (
                    <div id={CreditsScene.TIME} hidden={scene !== CreditsScene.TIME}>
                        <CreditsClock visibleTime={clockSceneVisibleTimeMs} />
                    </div>
                );
            case CreditsScene.FOLLOW:
                return (
                    <div id={CreditsScene.FOLLOW} hidden={scene !== CreditsScene.FOLLOW}>
                        <CreditsFollow />
                    </div>
                );
        }
    }, [scene]);

    return (
        <div id="credits" ref={creditsRef}>
            {sceneJsx}
        </div>
    );
};
