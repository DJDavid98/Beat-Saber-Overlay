import { DataDisplayProps } from '../beat-saber/DataDisplay';
import { useEffect, useRef, useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import { getRandomBool, getRandomInt } from '../utils/random';
import { defaultDataPoint, SCORE_UPDATE_MAX_GRANULARITY } from '../utils/draw-graphs';

interface MockDataEmitterStep {
    /**
     * Name of the current step, logged to the console
     */
    debug: string;
    /**
     * @returns Milliseconds to wait for, with an optional function to execute after the timeout ends
     */
    timeout: () => number | [number, VoidFunction];
    /**
     * @returns Function to execute on an interval every `number` milliseconds
     */
    interval?: () => [VoidFunction, number];
}

export const useMockData = (enabled: boolean): DataDisplayProps => {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [mapData, setMapData] = useState<DataDisplayProps['mapData']>(undefined);
    const [liveData, setLiveData] = useState<DataDisplayProps['liveData']>(undefined);
    const [readyState, setReadyState] = useState<DataDisplayProps['readyState']>(ReadyState.UNINSTANTIATED);

    useEffect(() => {
        if (!enabled) return;

        const stopInterval = () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
        const stopTimeout = () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
        const abortController = new AbortController();

        const restartMockSteps = () => {
            let mockSongDuration: number;
            let startedPlayingTs: number;
            let songSpeedMultiplier: number;
            let totalNotes: number;
            let missCount: number;
            let accuracyValue: number;
            let energyValue: number;
            let missNextNotes: number;
            let zenMode: boolean;
            let noFail: boolean;
            let lifeCount: number;
            const steps: MockDataEmitterStep[] = [
                {
                    debug: 'Connecting',
                    timeout: () => [0, () => setReadyState(ReadyState.CONNECTING)]
                },
                {
                    debug: 'Connected',
                    timeout: () => [getRandomInt(1e3, 2e3), () => setReadyState(ReadyState.OPEN)]
                },
                {
                    debug: 'Loading level', timeout: () => [getRandomInt(1e3, 2e3), () => {
                        mockSongDuration = getRandomInt(60, 300);
                        zenMode = getRandomBool(.90);
                        const lifeCountModifier = zenMode ? 1 : getRandomInt(0, 3);
                        noFail = lifeCountModifier === 0;
                        const oneLife = lifeCountModifier === 2;
                        const fourLives = lifeCountModifier === 3;
                        const noArrows = !zenMode && getRandomBool();
                        const speed = getRandomInt(0, 3);
                        const slowerSong = speed === 0;
                        const fasterSong = speed === 2;
                        const superFastSong = speed === 3;
                        songSpeedMultiplier = [0.85, 1, 1.2, 1.5][speed];
                        if (oneLife || fourLives) {
                            lifeCount = oneLife ? 1 : 4;
                        } else {
                            lifeCount = Infinity;
                        }
                        setMapData({
                            name: 'Mock Somewhat Longer Than Usual Song Name',
                            author: 'Mock Author',
                            subName: 'Mock Sub-name',
                            duration: mockSongDuration,
                            inLevel: true,
                            mapper: 'Mock Mapper',
                            difficulty: 'Mock Difficulty',
                            star: 6.9,
                            bsr: '621',
                            pp: 9001,
                            modifiers: {
                                noFail,
                                oneLife,
                                fourLives,
                                noBombs: !zenMode && getRandomBool(),
                                noWalls: !zenMode && getRandomBool(),
                                noArrows,
                                ghostNotes: !zenMode && getRandomBool(),
                                disappearingArrows: !zenMode && !noArrows && getRandomBool(),
                                smallNotes: !zenMode && getRandomBool(),
                                proMode: !zenMode && getRandomBool(),
                                strictAngles: !zenMode && !noArrows && getRandomBool(),
                                zenMode,
                                slowerSong,
                                fasterSong,
                                superFastSong,
                            }
                        });
                        setLiveData(defaultDataPoint);
                        startedPlayingTs = Date.now();
                        missNextNotes = 0;
                        totalNotes = 0;
                        missCount = defaultDataPoint.misses;
                        accuracyValue = defaultDataPoint.accuracy;
                        energyValue = lifeCount !== Infinity ? 100 : defaultDataPoint.energy;
                        console.info(`Song Speed: ${songSpeedMultiplier}x`);
                        console.info(`Song Length: ${mockSongDuration}s`);
                        console.info(`Realtime Length: ${mockSongDuration / songSpeedMultiplier}s`);
                    }]
                },
                {
                    debug: 'Playing',
                    timeout: () => (mockSongDuration * 1e3) / songSpeedMultiplier,
                    interval: () => [() => {
                        const timeElapsed = (Date.now() - startedPlayingTs) / 1e3;
                        const noteEncounter = !zenMode && getRandomBool(.66);
                        const skillIssue = missNextNotes > 0;
                        if (noteEncounter) {
                            totalNotes++;
                            // Simulated 85% accuracy
                            const isMiss = skillIssue || (energyValue === 0 ? getRandomBool(.75) : accuracyValue > 85 && energyValue > 20 && getRandomBool(.95));
                            if (skillIssue) missNextNotes--;
                            if (isMiss) missCount++;
                            console.info(isMiss ? 'Note missed' : 'Note hit');
                            accuracyValue = ((totalNotes - missCount) / totalNotes) * (96 + 2 * Math.sin(timeElapsed));
                            if (energyValue !== 0) {
                                let energyChange: number;
                                if (lifeCount !== Infinity) {
                                    energyChange = isMiss ? -(100 / lifeCount) : 0;
                                } else {
                                    energyChange = isMiss ? -(accuracyValue / 10) : 1;
                                }
                                energyValue = Math.max(0, Math.min(100, energyValue + energyChange));
                            }
                        }
                        if (!skillIssue && energyValue > 50 && getRandomBool(.99)) {
                            missNextNotes = getRandomInt(1, 5);
                            console.info(`Uh-oh, skill issue! The next ${missNextNotes} note${missNextNotes !== 1 ? 's' : ''} will be missed`);
                        }
                        setLiveData({
                            seconds: timeElapsed * songSpeedMultiplier,
                            accuracy: accuracyValue,
                            energy: energyValue,
                            misses: missCount
                        });
                    }, (SCORE_UPDATE_MAX_GRANULARITY * 1e3) / songSpeedMultiplier]
                },
                {
                    debug: 'Level finished',
                    timeout: () => [getRandomInt(2e3, 3e3), () => setMapData(state => ({
                        ...state,
                        inLevel: false
                    }))]
                },
                {
                    debug: 'Random disconnect',
                    timeout: () => getRandomInt(0, 15e3),
                    interval: () => [() => setReadyState(Date.now() % 10e3 < 5 ? ReadyState.CONNECTING : ReadyState.CLOSED), 5e3],
                },
                {
                    debug: 'Restart simulation',
                    timeout: () => [0, restartMockSteps]
                },
            ];

            void steps.reduce((finalPromise, step,
                stepIndex) => finalPromise.then(() => new Promise<void>((res,
                rej) => {
                console.group(`[Mock Data] Step #${stepIndex}: ${step.debug}`);
                const timeoutValue = step.timeout();
                const [timeoutMs, timeoutFn] = typeof timeoutValue === 'number' ? [timeoutValue] : timeoutValue;
                timeoutRef.current = setTimeout(() => {
                    if (abortController.signal.aborted) {
                        rej();
                        return;
                    }
                    timeoutFn?.();
                    if (step.interval) {
                        stopInterval();
                    }
                    console.groupEnd();
                    res();
                }, timeoutMs);
                if (step.interval) {
                    const [intervalFn, intervalMs] = step.interval();
                    intervalRef.current = setInterval(() => {
                        if (abortController.signal.aborted) {
                            rej();
                            return;
                        }
                        intervalFn();
                    }, intervalMs);
                }
            })), Promise.resolve());
        };

        restartMockSteps();

        return () => {
            abortController.abort();
            stopInterval();
            stopTimeout();
        };
    }, [enabled]);

    return { mapData, liveData, readyState };
};
