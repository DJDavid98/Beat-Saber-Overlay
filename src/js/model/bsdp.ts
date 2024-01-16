export enum ELiveDataEventTriggers {
    Unknown = 0,
    TimerElapsed = 1,
    NoteMissed = 2,
    EnergyChange = 3,
    ScoreChange = 4,
}

export enum NoteCutDirection {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
    UpLeft = 4,
    UpRight = 5,
    DownLeft = 6,
    DownRight = 7,
    Any = 8,
    None = 9,
}

export enum ColorType {
    ColorA = 0,
    ColorB = 1,
    None = -1,
}

export interface BsdpSBlockHitScore {
    PreSwing: number;
    PostSwing: number;
    CenterSwing: number;
}

export interface BsdpLiveData {
    Score: number;
    ScoreWithMultipliers: number;
    MaxScore: number;
    MaxScoreWithMultipliers: number;
    Rank: string;
    FullCombo: boolean;
    NotesSpawned: number;
    Combo: number;
    Misses: number;
    Accuracy: number;
    BlockHitScore: BsdpSBlockHitScore;
    PlayerHealth: number;
    TimeElapsed: number;
    UnixTimestamp: number;
    ColorType: number;
    CutDirection?: number;
    EventTrigger: number;
}

export interface BsdpModifiers {
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

export interface BsdpMapData {
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
    Modifiers: BsdpModifiers;
    ColorScheme?: Record<`Saber${'A' | 'B'}Color`, { HexCode: string } | null>;
}

export interface BsdpModData {
    EnabledPlugins: BsdpPluginMetadata[];
}

export interface BsdpPluginMetadata {
    Name: string;
    Version: string;
    Author: string;
    Description: string;
    HomeLink: string;
    SourceLink: string;
    DonateLink: string;
}
