import { dataValidatorFactory } from "../utils/data-validator-factory";
import Joi from "joi";
import { BsPlusEventMessageType, BsPlusResumeEventName } from "../model/bs-plus";

export interface BsPlusResumeEvent {
    _type: typeof BsPlusEventMessageType;
    _event: typeof BsPlusResumeEventName;
    resumeTime: number;
}

const schema = Joi.object<BsPlusResumeEvent>({
    _type: Joi.string().allow(BsPlusEventMessageType),
    _event: Joi.string().allow(BsPlusResumeEventName),
    resumeTime: Joi.number(),
});

export const validateBsPlusResumeEvent = dataValidatorFactory(schema);
