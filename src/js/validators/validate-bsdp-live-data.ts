import Joi from 'joi';
import { dataValidatorFactory } from '../utils/data-validator-factory';
import { BsdpLiveData } from '../model/bsdp';

const schema = Joi.object<BsdpLiveData>({
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
    ColorType: Joi.number(),
    CutDirection: Joi.number().optional(),
    EventTrigger: Joi.number(),
});

export const validateBsdpLiveData = dataValidatorFactory(schema);
