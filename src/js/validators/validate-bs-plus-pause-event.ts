import { dataValidatorFactory } from '../utils/data-validator-factory';
import Joi from 'joi';
import { BsPlusEventMessageType, BsPlusPauseEventName } from '../model/bs-plus';

export interface BsPlusPauseEvent {
    _type: typeof BsPlusEventMessageType;
    _event: typeof BsPlusPauseEventName;
    pauseTime: number;
}

const schema = Joi.object<BsPlusPauseEvent>({
    _type: Joi.string().allow(BsPlusEventMessageType),
    _event: Joi.string().allow(BsPlusPauseEventName),
    pauseTime: Joi.number(),
});

export const validateBsPlusPauseEvent = dataValidatorFactory(schema);
