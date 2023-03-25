import { DataDisplayProps } from "../DataDisplay";
import { useEffect, useRef, useState } from "react";
import { ReadyState } from "react-use-websocket";
import { getRandomBool, getRandomInt } from "../utils/random";
import { SCORE_UPDATE_MAX_GRANULARITY } from "../utils/draw-accuracy-graph";
import { timeToMockAccuracy } from "../utils/mappers";

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
            const steps: MockDataEmitterStep[] = [
                { debug: 'Connecting', timeout: () => [0, () => setReadyState(ReadyState.CONNECTING)] },
                { debug: 'Connected', timeout: () => [getRandomInt(1e3, 2e3), () => setReadyState(ReadyState.OPEN)] },
                {
                    debug: 'Loading level', timeout: () => [getRandomInt(2e3, 3e3), () => {
                        mockSongDuration = getRandomInt(30, 300);
                        const zenMode = getRandomBool();
                        const lives = zenMode ? Infinity : getRandomInt(0, 2);
                        const noFail = lives === 0;
                        const oneLife = lives === 1;
                        const fourLives = lives === 2;
                        const noArrows = !zenMode && getRandomBool();
                        const speed = getRandomInt(0, 3);
                        const slowerSong = speed === 0;
                        const fasterSong = speed === 2;
                        const superFastSong = speed === 3;
                        songSpeedMultiplier = [0.85, 1, 1.2, 1.5][speed];
                        setMapData({
                            name: 'Mock Song',
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
                        setLiveData({ timeElapsed: 0, accuracy: 100 });
                        startedPlayingTs = Date.now();
                        console.debug(`Song Speed: ${songSpeedMultiplier}x`);
                        console.debug(`Song Length: ${mockSongDuration}s`);
                        console.debug(`Realtime Length: ${mockSongDuration / songSpeedMultiplier}s`);
                    }]
                },
                {
                    debug: 'Playing',
                    timeout: () => (mockSongDuration * 1e3) / songSpeedMultiplier,
                    interval: () => [() => {
                        const timeElapsed = (Date.now() - startedPlayingTs) / 1e3;
                        const accuracy = timeToMockAccuracy(timeElapsed, mockSongDuration / songSpeedMultiplier, 0, 100);
                        setLiveData({ timeElapsed: timeElapsed * songSpeedMultiplier, accuracy });
                    }, SCORE_UPDATE_MAX_GRANULARITY]
                },
                {
                    debug: 'Level finished',
                    timeout: () => [getRandomInt(2e3, 3e3), () => setMapData(state => ({ ...state, inLevel: false }))]
                },
                {
                    debug: 'Random disconnect',
                    timeout: () => getRandomInt(10e3, 15e3),
                    interval: () => [() => setReadyState(Date.now() % 10e3 < 5 ? ReadyState.CONNECTING : ReadyState.CLOSED), 5e3],
                },
                {
                    debug: 'Reconnect',
                    timeout: () => [getRandomInt(1e3, 2e3), restartMockSteps]
                },
            ];

            void steps.reduce((finalPromise, step, stepIndex) => finalPromise.then(() => new Promise<void>((res,
                rej) => {
                console.group(`[Mock Data] Step #${stepIndex}: ${step.debug}`);
                const timeoutValue = step.timeout();
                const [timeoutMs, timeoutFn] = typeof timeoutValue === "number" ? [timeoutValue] : timeoutValue;
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
