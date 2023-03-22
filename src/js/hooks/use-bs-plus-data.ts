import { DataDisplayProps } from "../DataDisplay";
import { useReconnectingWebsocket } from "./use-reconnecting-websocket";
import { bsPlusDataSource } from "../utils/constants";
import { Reducer, useCallback, useMemo, useReducer } from "react";
import { validateBsPlusHandshake } from "../validators/validate-bs-plus-handshake";
import { validateBsPlusGameStateEvent } from "../validators/validate-bs-plus-game-state-event";
import {
    BsPlusAction,
    BsPlusDataState,
    BsPlusEventMessageType,
    BsPlusGameStateEventName,
    BsPlusHandshakeMessageType,
    BsPlusMapInfoEventName,
    BsPlusScoreEventName
} from "../model/bs-plus";
import { validateBsPlusMapInfoEvent } from "../validators/validate-bs-plus-map-info-event";
import { validateBsPlusScoreEvent } from "../validators/validate-bs-plus-score-event";

const bsPlusDataReducer: Reducer<BsPlusDataState, BsPlusAction> = (state, action) => {
    console.log('bsPlusDataReducer', action);
    if (action !== null && action._type === BsPlusEventMessageType) {
        switch (action._event) {
            case BsPlusGameStateEventName:
                return { ...state, gameState: action.gameStateChanged };
            case BsPlusMapInfoEventName:
                return { ...state, mapInfo: action.mapInfoChanged };
            case BsPlusScoreEventName:
                return { ...state, score: action.scoreEvent };
        }
    }
    return state;
};

const bsPlusDataDefaultState: BsPlusDataState = {};

export const useBsPlusData = (enabled: boolean): DataDisplayProps => {
    const [{ mapInfo, gameState, score }, dispatch] = useReducer(bsPlusDataReducer, bsPlusDataDefaultState);
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
                    case BsPlusGameStateEventName:
                        dispatch(validateBsPlusGameStateEvent(data));
                        return;
                    case BsPlusMapInfoEventName:
                        dispatch(validateBsPlusMapInfoEvent(data));
                        return;
                    case BsPlusScoreEventName:
                        dispatch(validateBsPlusScoreEvent(data));
                        return;
                }
                return;
            case "resume":
            case "pause":
                // Ignored events
                return;
            default:
                console.info(`Unhandled BS+ Socket Message of type ${messageType}`, data);
        }
    }, []);
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
        timeElapsed: score.time,
    } : undefined, [score]);

    return { mapData, liveData, readyState: webSocket.readyState };
};
