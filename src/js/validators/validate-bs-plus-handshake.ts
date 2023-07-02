import { dataValidatorFactory } from '../utils/data-validator-factory';
import Joi from 'joi';
import { BsPlusHandshakeMessageType, BsPlusProtocolVersion } from '../model/bs-plus';

export interface BsPlusHandshake {
    _type: typeof BsPlusHandshakeMessageType;
    protocolVersion: typeof BsPlusProtocolVersion;
    gameVersion: string;
    playerName: string;
    playerPlatformId: string;
}

const schema = Joi.object<BsPlusHandshake>({
    _type: Joi.string().allow(BsPlusHandshakeMessageType),
    protocolVersion: Joi.number().allow(BsPlusProtocolVersion),
    gameVersion: Joi.string(),
    playerName: Joi.string(),
    playerPlatformId: Joi.string(),
});

export const validateBsPlusHandshake = dataValidatorFactory(schema);
