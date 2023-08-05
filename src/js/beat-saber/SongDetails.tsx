import { FunctionComponent, useMemo } from 'react';
import { mapDifficulty } from '../utils/mappers';
import { useDurationFormatTimer } from '../hooks/use-duration-format-timer';

export interface SongDetails {
    difficulty?: string;
    bsr?: string | null;
    star?: number;
    pp?: number;
    duration?: number
}

export const SongDetails: FunctionComponent<SongDetails> = ({
    difficulty,
    bsr,
    star,
    pp,
    duration
}) => {
    const nf = useMemo(() => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }), []);
    const df = useDurationFormatTimer();

    return <div id="song-details">
        {difficulty && <span className="difficulty">{mapDifficulty(difficulty)}</span>}
        {!!duration && <span className="duration">{df.format(duration)}</span>}
        {!!star && <span className="star">☆ {nf.format(star)}</span>}
        {!!pp && <span className="pp">{nf.format(pp)}pp</span>}
        {bsr && <span className="bsr">!bsr {mapDifficulty(bsr)}</span>}
    </div>;
};
