export interface BeatSaverMapMetadata {
    duration: number;
    songName: string;
    songSubName: string;
    songAuthorName: string;
    levelAuthorName: string;
}

export interface BeatSaverMapVersion {
    state: string;
    diffs: BeatSaverMapVersionDifficulty[];
    createdAt: string;
    coverURL?: string;
}

export interface BeatSaverMapVersionDifficulty {
    characteristic: string;
    difficulty: string;
}

export interface BeatSaverMapData {
    id: string;
    metadata?: BeatSaverMapMetadata;
    versions?: BeatSaverMapVersion[];
}
