import { useFailsafeWebsocket } from './use-failsafe-websocket';
import { bsdpDataSource } from '../utils/constants';
import { validateBsdpMapData } from '../validators/validate-bsdp-map-data';
import { DataDisplayProps } from '../beat-saber/DataDisplay';
import { useMemo } from 'react';
import { validateBsdpLiveData } from '../validators/validate-bsdp-live-data';

export const useBsdpData = (enabled: boolean): DataDisplayProps => {
    const {
        message: bsdpMapData,
        readyState
    } = useFailsafeWebsocket(enabled ? `${bsdpDataSource}/MapData` : null, validateBsdpMapData, enabled);

    const mapData: DataDisplayProps['mapData'] = useMemo(() => bsdpMapData ? {
        author: bsdpMapData.SongAuthor,
        bsr: bsdpMapData.BSRKey,
        difficulty: bsdpMapData.Difficulty,
        duration: bsdpMapData.Duration,
        inLevel: bsdpMapData.InLevel,
        mapper: bsdpMapData.Mapper,
        modifiers: {
            disappearingArrows: bsdpMapData.Modifiers.DisappearingArrows,
            fasterSong: bsdpMapData.Modifiers.FasterSong,
            fourLives: bsdpMapData.Modifiers.FourLives,
            ghostNotes: bsdpMapData.Modifiers.GhostNotes,
            noArrows: bsdpMapData.Modifiers.NoArrows,
            noBombs: bsdpMapData.Modifiers.NoBombs,
            noFail: bsdpMapData.Modifiers.NoFailOn0Energy,
            noWalls: bsdpMapData.Modifiers.NoWalls,
            oneLife: bsdpMapData.Modifiers.OneLife,
            proMode: bsdpMapData.Modifiers.ProMode,
            slowerSong: bsdpMapData.Modifiers.SlowerSong,
            smallNotes: bsdpMapData.Modifiers.SmallNotes,
            strictAngles: bsdpMapData.Modifiers.StrictAngles,
            superFastSong: bsdpMapData.Modifiers.SuperFastSong,
            zenMode: bsdpMapData.Modifiers.ZenMode,
        },
        name: bsdpMapData.SongName,
        pp: bsdpMapData.PP,
        star: bsdpMapData.Star,
        subName: bsdpMapData.SongSubName,
        url: bsdpMapData.CoverImage ?? undefined,
        leftSaberColor: bsdpMapData.ColorScheme?.SaberAColor?.HexCode ?? undefined,
        rightSaberColor: bsdpMapData.ColorScheme?.SaberBColor?.HexCode ?? undefined,
    } : undefined, [bsdpMapData]);
    const { message: bsdpLiveData } = useFailsafeWebsocket(enabled ? `${bsdpDataSource}/LiveData` : null, validateBsdpLiveData);

    const liveData: DataDisplayProps['liveData'] = useMemo(() => bsdpLiveData ? {
        accuracy: bsdpLiveData.Accuracy,
        seconds: bsdpLiveData.TimeElapsed,
        energy: bsdpLiveData.PlayerHealth,
        misses: bsdpLiveData.Misses,
        trigger: bsdpLiveData.EventTrigger,
        color: bsdpLiveData.ColorType,
        cutDirection: bsdpLiveData.CutDirection,
    } : undefined, [bsdpLiveData]);

    return { mapData, liveData, readyState };
};
