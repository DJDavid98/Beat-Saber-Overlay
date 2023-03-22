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
}
