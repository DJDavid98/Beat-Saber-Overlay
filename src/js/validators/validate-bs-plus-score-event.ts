import { dataValidatorFactory } from '../utils/data-validator-factory';
import Joi from 'joi';
import { BsPlusEventMessageType, BsPlusScore, BsPlusScoreEventName } from '../model/bs-plus';

export interface BsPlusScoreEvent {
    _type: typeof BsPlusEventMessageType;
    _event: typeof BsPlusScoreEventName;
    scoreEvent: BsPlusScore;
}

const schema = Joi.object<BsPlusScoreEvent>({
    _type: Joi.string().allow(BsPlusEventMessageType),
    _event: Joi.string().allow(BsPlusScoreEventName),
    scoreEvent: Joi.object({
        time: Joi.number(),
        score: Joi.number(),
        accuracy: Joi.number(),
        combo: Joi.number(),
        missCount: Joi.number(),
        currentHealth: Joi.number(),
    }),
});

export const validateBsPlusScoreEvent = dataValidatorFactory(schema);
