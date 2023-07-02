import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { CreditsClock } from './CreditsClock';

enum CreditsScene {
    LINKS = 'credits-links',
    TIME = 'credits-time',
}

const sceneOrder = [CreditsScene.LINKS, CreditsScene.TIME];

const getNextScene = (currentScene: CreditsScene) => {
    const nextSceneIndex = sceneOrder.indexOf(currentScene) + 1;
    return sceneOrder[nextSceneIndex === sceneOrder.length ? 0 : nextSceneIndex];
};

const sceneTransitionDurationMs = 500;
const sceneDisplayTimeMs = 20e3;
const sceneVisibleTimeMs = sceneDisplayTimeMs + sceneTransitionDurationMs;

export const Credits: FC = () => {
    const creditsRef = useRef<HTMLDivElement>(null);
    const [scene, setScene] = useState(sceneOrder[0]);

    useEffect(() => {
        if (!creditsRef.current) return;

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
        const appearAnimation = creditsRef.current.animate(transitionEffectFrames, transitionEffectOptions);
        let disappearAnimation: Animation | undefined;
        let sceneSwitchTimeout: ReturnType<typeof setTimeout> | undefined;
        appearAnimation.addEventListener('finish', () => {
            sceneSwitchTimeout = setTimeout(() => {
                if (!creditsRef.current) return;

                disappearAnimation = creditsRef.current.animate(transitionEffectFrames.reverse(), transitionEffectOptions);
                disappearAnimation.addEventListener('finish', () => {
                    setScene(getNextScene(scene));
                });
            }, sceneDisplayTimeMs);
        });

        return () => {
            appearAnimation.cancel();
            disappearAnimation?.cancel();
            clearTimeout(sceneSwitchTimeout);
        };
    }, [scene]);

    const sceneJsx = useMemo(() => {
        switch (scene) {
            case CreditsScene.LINKS:
                return (
                    <div id={CreditsScene.LINKS} hidden={scene !== CreditsScene.LINKS}>
                        <a href="https://djdavid98.art" target="_blank" rel="noopener noreferrer">
                            <img src="https://djdavid98.art/logos/djdavid98.svg" alt="DJDavid98" />
                        </a>
                        <a href="https://overlay.djdavid98.art">overlay.djdavid98.art</a>
                    </div>
                );
            case CreditsScene.TIME:
                return (
                    <div id={CreditsScene.TIME} hidden={scene !== CreditsScene.TIME}>
                        <CreditsClock visibleTime={sceneVisibleTimeMs} />
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
