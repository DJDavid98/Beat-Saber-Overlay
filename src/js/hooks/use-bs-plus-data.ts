import { DataDisplayProps } from "../DataDisplay";
import { useReconnectingWebsocket } from "./use-reconnecting-websocket";
import { bsPlusDataSource } from "../utils/constants";
import { Reducer, useCallback, useMemo, useReducer, useRef } from "react";
import { validateBsPlusHandshake } from "../validators/validate-bs-plus-handshake";
import { validateBsPlusGameStateEvent } from "../validators/validate-bs-plus-game-state-event";
import {
    BsPlusAction,
    BsPlusDataState,
    BsPlusEventMessageType,
    BsPlusGameStateEventName,
    BsPlusHandshakeMessageType,
    BsPlusMapInfoEventName,
    BsPlusPauseEventName,
    BsPlusResumeEventName,
    BsPlusScoreEventName,
    BsPlusTickEventName
} from "../model/bs-plus";
import { validateBsPlusMapInfoEvent } from "../validators/validate-bs-plus-map-info-event";
import { validateBsPlusScoreEvent } from "../validators/validate-bs-plus-score-event";
import { validateBsPlusPauseEvent } from "../validators/validate-bs-plus-pause-event";
import { validateBsPlusResumeEvent } from "../validators/validate-bs-plus-resume-event";
import { SCORE_UPDATE_MAX_GRANULARITY } from "../utils/draw-accuracy-graph";

const tickUpdateFrequency = 1e3 * SCORE_UPDATE_MAX_GRANULARITY;

const bsPlusDataReducer: Reducer<BsPlusDataState, BsPlusAction> = (state, action) => {
    console.log('bsPlusDataReducer', action);
    if (typeof action !== 'object') {
        switch (action) {
            case BsPlusTickEventName:
                if (state.gameState === 'Playing' && state.score && state.mapInfo) {
                    const nowMsTs = Date.now();
                    const lastDataMsTs = state.score.ts?.getTime();
                    const secondsElapsedSinceLastData = (nowMsTs - lastDataMsTs) / 1e3;
                    const newTime = state.score.time + (secondsElapsedSinceLastData * state.mapInfo.timeMultiplier);
                    return { ...state, score: { ...state.score, visualTime: newTime } };
                }
                break;
        }
    } else if (action !== null && action._type === BsPlusEventMessageType) {
        switch (action._event) {
            case BsPlusGameStateEventName:
                return { ...state, gameState: action.gameStateChanged };
            case BsPlusMapInfoEventName:
                return { ...state, mapInfo: action.mapInfoChanged };
            case BsPlusScoreEventName:
                return {
                    ...state,
                    score: { ...action.scoreEvent, ts: new Date(), visualTime: action.scoreEvent.time }
                };
            case BsPlusPauseEventName:
                if (state.score) {
                    return {
                        ...state,
                        score: { ...state.score, time: action.pauseTime, visualTime: action.pauseTime, ts: new Date() }
                    };
                }
                break;
            case BsPlusResumeEventName:
                if (state.score) {
                    return {
                        ...state,
                        score: {
                            ...state.score,
                            time: action.resumeTime,
                            visualTime: action.resumeTime,
                            ts: new Date()
                        }
                    };
                }
                break;
        }
    }
    return state;
};

const bsPlusDataDefaultState: BsPlusDataState = {};

export const useBsPlusData = (enabled: boolean): DataDisplayProps => {
    const updateInterval = useRef<number | null>(null);
    const [{ mapInfo, gameState, score }, dispatch] = useReducer(bsPlusDataReducer, bsPlusDataDefaultState);
    const updateTick = useCallback(() => {
        // Send "fake" score updates with existing data based on the time elapsed
        dispatch(BsPlusTickEventName);
    }, []);
    const stopUpdateTicking = useCallback(() => {
        if (updateInterval.current !== null) {
            clearInterval(updateInterval.current);
            updateInterval.current = null;
        }
    }, []);
    const startUpdateTicking = useCallback((initial = true) => {
        if (initial) {
            updateTick();
        }
        stopUpdateTicking();
        updateInterval.current = setInterval(updateTick, tickUpdateFrequency);
    }, [stopUpdateTicking, updateTick]);
    const handleMessage = useCallback((event: WebSocketEventMap['message']) => {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch (e) {
            console.error(e);
            return;
        }

        if (!('_type' in data)) {
            console.error('No message type found in payload', data);
            return;
        }

        const messageType = data._type;
        switch (messageType) {
            case BsPlusHandshakeMessageType:
                dispatch(validateBsPlusHandshake(data));
                return;
            case BsPlusEventMessageType:
                switch (data?._event) {
                    case BsPlusGameStateEventName: {
                        const payload = validateBsPlusGameStateEvent(data);
                        if (payload) {
                            if (payload.gameStateChanged === 'Menu') {
                                stopUpdateTicking();
                            }
                            dispatch(payload);
                        }
                    }
                        return;
                    case BsPlusMapInfoEventName:
                        dispatch(validateBsPlusMapInfoEvent(data));
                        startUpdateTicking();
                        return;
                    case BsPlusScoreEventName:
                        dispatch(validateBsPlusScoreEvent(data));
                        return;
                    case BsPlusPauseEventName:
                        stopUpdateTicking();
                        dispatch(validateBsPlusPauseEvent(data));
                        return;
                    case BsPlusResumeEventName:
                        startUpdateTicking();
                        dispatch(validateBsPlusResumeEvent(data));
                        return;
                }
                return;
            default:
                console.info(`Unhandled BS+ Socket Message of type ${messageType}`, data);
        }
    }, [updateTick]);
    const webSocket = useReconnectingWebsocket(enabled ? bsPlusDataSource : null, enabled, handleMessage);

    const mapData: DataDisplayProps['mapData'] = useMemo(() => mapInfo ? {
        author: mapInfo.artist,
        mapper: mapInfo.mapper,
        name: mapInfo.name,
        subName: mapInfo.sub_name,
        url: mapInfo.coverRaw ? `data:image/png;base64,${mapInfo.coverRaw}` : undefined,
        bsr: mapInfo.BSRKey,
        difficulty: mapInfo.difficulty,
        pp: mapInfo.PP,
        inLevel: gameState === 'Playing',
        duration: mapInfo.duration / 1e3,
        // Not available in BeatSaberPlus
        star: undefined,
    } : undefined, [mapInfo, gameState]);

    const liveData: DataDisplayProps['liveData'] = useMemo(() => score ? {
        accuracy: score.accuracy * 100,
        timeElapsed: score.visualTime,
    } : undefined, [score]);

    return { mapData, liveData, readyState: webSocket.readyState };
};
