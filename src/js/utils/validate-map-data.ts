import Joi from "joi";
import { dataValidatorFactory } from "./data-validator-factory";

export interface Modifiers {
    NoFailOn0Energy: boolean;
    OneLife: boolean;
    FourLives: boolean;
    NoBombs: boolean;
    NoWalls: boolean;
    NoArrows: boolean;
    GhostNotes: boolean;
    DisappearingArrows: boolean;
    SmallNotes: boolean;
    ProMode: boolean;
    StrictAngles: boolean;
    ZenMode: boolean;
    SlowerSong: boolean;
    FasterSong: boolean;
    SuperFastSong: boolean;
}

export interface MapData {
    InLevel: boolean;
    LevelPaused: boolean;
    LevelFinished: boolean;
    LevelFailed: boolean;
    LevelQuit: boolean;
    SongName: string;
    SongSubName: string;
    SongAuthor: string;
    Mapper: string;
    Difficulty: string;
    Duration: number;
    Star: number;
    PP: number;
    BSRKey: string | null;
    CoverImage: string | null;
    Modifiers: Modifiers;
}

const mapDataSchema = Joi.object<MapData>({
    InLevel: Joi.boolean(),
    SongName: Joi.string().allow(''),
    SongSubName: Joi.string().allow(''),
    SongAuthor: Joi.string().allow(''),
    Mapper: Joi.string().allow(''),
    Difficulty: Joi.string().allow(''),
    Star: Joi.number(),
    PP: Joi.number(),
    Duration: Joi.number(),
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
});

export const validateMapData = dataValidatorFactory(mapDataSchema);
