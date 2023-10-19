import Joi from 'joi';
import { dataValidatorFactory } from '../utils/data-validator-factory';
import {
    BeatSaverMapData,
    BeatSaverMapMetadata,
    BeatSaverMapVersion,
    BeatSaverMapVersionDifficulty
} from '../model/beat-saver';

const mapDataSchema = Joi.object<BeatSaverMapData>({
    id: Joi.string(),
    metadata: Joi.object<BeatSaverMapMetadata>({
        duration: Joi.number(),
        levelAuthorName: Joi.string().allow(''),
        songAuthorName: Joi.string().allow(''),
        songName: Joi.string().allow(''),
        songSubName: Joi.string().allow(''),
    }),
    versions: Joi.array().items(Joi.object<BeatSaverMapVersion>({
        coverURL: Joi.string().optional().allow(''),
        state: Joi.string(),
        createdAt: Joi.string().isoDate(),
        diffs: Joi.array().items(Joi.object<BeatSaverMapVersionDifficulty>({
            characteristic: Joi.string(),
            difficulty: Joi.string(),
        }))
    })),
});

export const validateBeatSaverMapData = dataValidatorFactory(mapDataSchema);
