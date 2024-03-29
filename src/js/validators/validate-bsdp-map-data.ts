import Joi from 'joi';
import { dataValidatorFactory } from '../utils/data-validator-factory';
import { BsdpMapData } from '../model/bsdp';

const mapDataSchema = Joi.object<BsdpMapData>({
    InLevel: Joi.boolean(),
    LevelPaused: Joi.boolean(),
    LevelFinished: Joi.boolean(),
    LevelFailed: Joi.boolean(),
    LevelQuit: Joi.boolean(),
    SongName: Joi.string().allow(''),
    SongSubName: Joi.string().allow(''),
    SongAuthor: Joi.string().allow(''),
    Mapper: Joi.string().allow(''),
    Difficulty: Joi.string().allow(''),
    Duration: Joi.number(),
    Star: Joi.number(),
    PP: Joi.number(),
    BSRKey: Joi.string().allow(null),
    CoverImage: Joi.string().allow(null),
    Modifiers: Joi.object({
        NoFailOn0Energy: Joi.boolean(),
        OneLife: Joi.boolean(),
        FourLives: Joi.boolean(),
        NoBombs: Joi.boolean(),
        NoWalls: Joi.boolean(),
        NoArrows: Joi.boolean(),
        GhostNotes: Joi.boolean(),
        DisappearingArrows: Joi.boolean(),
        SmallNotes: Joi.boolean(),
        ProMode: Joi.boolean(),
        StrictAngles: Joi.boolean(),
        ZenMode: Joi.boolean(),
        SlowerSong: Joi.boolean(),
        FasterSong: Joi.boolean(),
        SuperFastSong: Joi.boolean(),
    }),
    ColorScheme: Joi.object({
        SaberAColor: Joi.object({
            HexCode: Joi.string(),
        }).allow(null),
        SaberBColor: Joi.object({
            HexCode: Joi.string(),
        }).allow(null),
    }).optional(),
});

export const validateBsdpMapData = dataValidatorFactory(mapDataSchema);
