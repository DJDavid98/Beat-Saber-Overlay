import Joi from "joi";
import { dataValidatorFactory } from "./data-validator-factory";

export interface SBlockHitScore {
    PreSwing: number;
    PostSwing: number;
    CenterSwing: number;
}

export interface LiveData {
    Score: number;
    ScoreWithMultipliers: number;
    MaxScore: number;
    MaxScoreWithMultipliers: number;
    Rank: string;
    FullCombo: boolean;
    NotesSpawned: number;
    Combo: number;
    Misses: number;
    Accuracy: number;
    BlockHitScore: SBlockHitScore;
    PlayerHealth: number;
    TimeElapsed: number;
    UnixTimestamp: number;
}

const liveDataSchema = Joi.object<LiveData>({
    Score: Joi.number(),
    ScoreWithMultipliers: Joi.number(),
    MaxScore: Joi.number(),
    MaxScoreWithMultipliers: Joi.number(),
    Rank: Joi.string(),
    FullCombo: Joi.boolean(),
    NotesSpawned: Joi.number(),
    Combo: Joi.number(),
    Misses: Joi.number(),
    Accuracy: Joi.number(),
    BlockHitScore: Joi.object({
        PreSwing: Joi.number(),
        PostSwing: Joi.number(),
        CenterSwing: Joi.number(),
    }),
    PlayerHealth: Joi.number(),
    TimeElapsed: Joi.number(),
    UnixTimestamp: Joi.number(),
});

export const validateLiveData = dataValidatorFactory(liveDataSchema);
