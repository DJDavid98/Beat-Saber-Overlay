import { dataValidatorFactory } from "../utils/data-validator-factory";
import Joi from "joi";
import { BsPlusGameStateEventName, BsPlusGameState, BsPlusGameStates, BsPlusEventMessageType } from "../model/bs-plus";

export interface BsPlusGameStateEvent {
    _type: typeof BsPlusEventMessageType;
    _event: typeof BsPlusGameStateEventName;
    gameStateChanged: BsPlusGameState;
}

const schema = Joi.object<BsPlusGameStateEvent>({
    _type: Joi.string().allow(BsPlusEventMessageType),
    _event: Joi.string().allow(BsPlusGameStateEventName),
    gameStateChanged: Joi.string().allow(...BsPlusGameStates),
});

export const validateBsPlusGameStateEvent = dataValidatorFactory(schema);
