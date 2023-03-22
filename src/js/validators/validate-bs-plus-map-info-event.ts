import { dataValidatorFactory } from "../utils/data-validator-factory";
import Joi from "joi";
import { BsPlusMapInfo, BsPlusMapInfoEventName, BsPlusEventMessageType } from "../model/bs-plus";

export interface BsPlusMapInfoEvent {
    _type: typeof BsPlusEventMessageType;
    _event: typeof BsPlusMapInfoEventName;
    mapInfoChanged: BsPlusMapInfo;
}

const schema = Joi.object<BsPlusMapInfoEvent>({
    _type: Joi.string().allow(BsPlusEventMessageType),
    _event: Joi.string().allow(BsPlusMapInfoEventName),
    mapInfoChanged: Joi.object({
        level_id: Joi.string(),
        name: Joi.string().allow(''),
        sub_name: Joi.string().allow(''),
        artist: Joi.string().allow(''),
        mapper: Joi.string().allow(''),
        characteristic: Joi.string(),
        difficulty: Joi.string(),
        duration: Joi.number(),
        BPM: Joi.number(),
        PP: Joi.number(),
        BSRKey: Joi.string().allow(''),
        coverRaw: Joi.string(),
        time: Joi.number(),
        timeMultiplier: Joi.number(),
    }),
});

export const validateBsPlusMapInfoEvent = dataValidatorFactory(schema);
