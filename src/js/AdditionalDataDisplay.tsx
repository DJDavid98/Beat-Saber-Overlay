import { failsafeWebsocketHookFactory } from "./utils/failsafe-websocket-hook-factory";
import { dataSource } from "./utils/constants";
import { LiveData, validateLiveData } from "./utils/validate-live-data";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modifiers } from "./utils/validate-map-data";
import { DataPoint, drawAccuracyGraph } from "./utils/draw-accuracy-graph";

const modifierNames: Record<keyof Modifiers, string> = {
    DisappearingArrows: 'Disappearing Arrows',
    FasterSong: 'Faster Song',
    FourLives: '4 Lives',
    GhostNotes: 'Ghost Notes',
    NoArrows: 'No Arrows',
    ProMode: 'Pro Mode',
    NoBombs: 'No Bombs',
    NoWalls: 'No Walls',
    NoFailOn0Energy: 'No Fail',
    OneLife: '1 Life',
    SlowerSong: 'Slower Song',
    SmallNotes: 'Small Notes',
    StrictAngles: 'Strict Angles',
    SuperFastSong: 'Super Fast Song',
    ZenMode: 'Zen Mode',
};

interface LiveDataProps {
    modifiers?: Modifiers;
    songLength?: number;
    reset?: boolean;
}

export const AdditionalDataDisplay: FC<LiveDataProps> = ({ modifiers, songLength, reset }) => {
    const dataPoints = useRef<DataPoint[] | null>();
    const startFromSeconds = useRef<number | null>(null);
    const [accuracy, setAccuracy] = useState<string | undefined>();
    const nf = useMemo(() => new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }), []);
    const messageHandler = useCallback((liveData: LiveData | null) => {
        if (!liveData) {
            return;
        }
        setAccuracy(nf.format(liveData.Accuracy / 100));

        if (!dataPoints.current) {
            return;
        }
        const dataPoint: DataPoint = { seconds: liveData.TimeElapsed, accuracy: liveData.Accuracy };
        if (startFromSeconds.current === null) {
            startFromSeconds.current = liveData.TimeElapsed > 1 ? liveData.TimeElapsed : 0;
        }
        dataPoints.current.push(dataPoint);
        if (accCanvas.current && songLength) {
            drawAccuracyGraph(accCanvas.current, dataPoints.current, songLength, startFromSeconds.current);
        }
    }, [nf, songLength]);
    const useFailsafeWebsocket = useMemo(() => failsafeWebsocketHookFactory(validateLiveData, messageHandler), [messageHandler]);
    useFailsafeWebsocket(`${dataSource}/LiveData`);
    const accCanvas = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        if (!reset) return;

        // Clear data points on song change
        dataPoints.current = [];
        startFromSeconds.current = null;
    }, [reset]);

    const modifierLabels = useMemo(() => {
        if (!modifiers) return [];

        const modifierKeys = Object.keys(modifiers) as Array<keyof typeof modifiers>;
        return modifierKeys.reduce(
            (keys, key) => modifiers[key] ? [...keys, modifierNames[key]] : keys,
            [] as string[]
        );
    }, [modifiers]);

    // Change accuracy graph width based on song length, between a sane minimum and maximum value
    const accuracyGraphLength = useMemo(() => songLength ? Math.max(60, Math.min(400, songLength * 2)) : 0, [songLength]);

    return <>
        {accuracyGraphLength > 0 && (
            <div>
                <span className="additional-data-label">{accuracy} Accuracy</span>
                <div id="accuracy-graph-wrapper">
                    <canvas width={accuracyGraphLength} height={40} ref={accCanvas} />
                </div>
            </div>
        )}
        {modifierLabels.length > 0 && (
            <div>
                <span className="additional-data-label">Modifiers</span>
                <ul id="modifier-list">
                    {modifierLabels.map(label => <li key={label}>{label}</li>)}
                </ul>
            </div>
        )}
    </>
}
