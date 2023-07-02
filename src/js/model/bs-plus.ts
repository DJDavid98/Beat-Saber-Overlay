import { BsPlusHandshake } from '../validators/validate-bs-plus-handshake';
import { BsPlusGameStateEvent } from '../validators/validate-bs-plus-game-state-event';
import { BsPlusMapInfoEvent } from '../validators/validate-bs-plus-map-info-event';
import { BsPlusScoreEvent } from '../validators/validate-bs-plus-score-event';
import { BsPlusPauseEvent } from '../validators/validate-bs-plus-pause-event';
import { BsPlusResumeEvent } from '../validators/validate-bs-plus-resume-event';

/**
 * @fileOverview
 * @see https://github.com/hardcpp/BeatSaberPlus/wiki/%5BEN%5D-Song-Overlay
 */

export const BsPlusProtocolVersion = 1;
export const BsPlusHandshakeMessageType = 'handshake';
export const BsPlusEventMessageType = 'event';

export const BsPlusGameStateEventName = 'gameState';
export const BsPlusGameStates = ['Menu', 'Playing'] as const;
export type BsPlusGameState = (typeof BsPlusGameStates)[number];

export const BsPlusMapInfoEventName = 'mapInfo';

export interface BsPlusMapInfo {
    /**
     * Level ID
     */
    level_id: string,
    /**
     * Song name
     */
    name: string,
    /**
     * Song sub-name
     */
    sub_name: string,
    /**
     * Song artist
     */
    artist: string,
    /**
     * Map author
     */
    mapper: string,
    /**
     * Difficulty characteristic (Standard, OneSaber, NoArrows, 360Degree)
     */
    characteristic: string,
    /**
     * Map difficulty
     */
    difficulty: string,
    /**
     * Song duration in milliseconds
     */
    duration: number,
    /**
     * Song beats per minute
     */
    BPM: number,
    /**
     * Performance points
     */
    PP: number,
    /**
     * BeatSaver key
     */
    BSRKey: string,
    /**
     * Raw cover image
     */
    coverRaw: string,
    /**
     * Map time in second
     */
    time: number,
    /**
     * Time multiplier
     */
    timeMultiplier: number,
}

export const BsPlusScoreEventName = 'score';

export interface BsPlusScore {
    /**
     * Current time in second
     */
    time: number;
    /**
     * Current score
     */
    score: number;
    /**
     * Current multiplied accuracy
     */
    accuracy: number;
    /**
     * Current combo
     */
    combo: number;
    /**
     * Miss & bad cut count for the player
     */
    missCount: number;
    /**
     * Current health
     */
    currentHealth: number;
}

export const BsPlusResumeEventName = 'resume';
export const BsPlusPauseEventName = 'pause';

export const BsPlusTickEventName = 'tick';

export interface BsPlusDataState {
    gameState?: BsPlusGameState;
    mapInfo?: BsPlusMapInfo;
    score?: BsPlusScore & { ts: Date; visualTime: number };
}

export type BsPlusAction =
    null
    | BsPlusHandshake
    | BsPlusGameStateEvent
    | BsPlusMapInfoEvent
    | BsPlusScoreEvent
    | BsPlusResumeEvent
    | BsPlusPauseEvent
    | typeof BsPlusTickEventName;
