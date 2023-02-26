import { useFailsafeWebsocket } from "./utils/use-failsafe-websocket";
import { dataSource } from "./utils/constants";
import { validateLiveData } from "./utils/validate-live-data";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Modifiers } from "./utils/validate-map-data";
import { DataPoint, drawAccuracyGraph } from "./utils/draw-accuracy-graph";
import { AdditionalDataModifiers } from "./AdditionalDataModifiers";

interface LiveDataProps {
    modifiers?: Modifiers;
    songLength?: number;
    /**
     * Signal boolean which is flipped each time the additional data component should reset its internal state
     */
    reset?: boolean;
}

export const AdditionalDataDisplay: FC<LiveDataProps> = ({ modifiers, songLength, reset }) => {
    const dataPoints = useRef<DataPoint[] | null>();
    const startFromSeconds = useRef<number | null>(null);
    const [accuracy, setAccuracy] = useState<string | undefined>();
    const accCanvas = useRef<HTMLCanvasElement | null>(null);
    const nf = useMemo(() => new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }), []);
    const { message: liveData } = useFailsafeWebsocket(`${dataSource}/LiveData`, validateLiveData);

    useEffect(() => {
        if (!liveData) {
            return;
        }
        setAccuracy(nf.format(liveData.Accuracy / 100));

        if (!dataPoints.current) {
            return;
        }
        const dataPoint: DataPoint = { seconds: liveData.TimeElapsed, accuracy: liveData.Accuracy };
        if (startFromSeconds.current === null) {
            startFromSeconds.current = dataPoint.seconds;
        }
        dataPoints.current.push(dataPoint);
        if (accCanvas.current && songLength) {
            drawAccuracyGraph(accCanvas.current, dataPoints.current, songLength, startFromSeconds.current);
        }
    }, [liveData, nf, songLength]);

    useEffect(() => {
        if (!reset) return;

        // Clear data points on song change
        dataPoints.current = [];
        startFromSeconds.current = null;
    }, [reset]);

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
        <AdditionalDataModifiers modifiers={modifiers} />
    </>
}
