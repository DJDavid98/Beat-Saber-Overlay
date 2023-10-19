import { FunctionComponent, useMemo } from 'react';
import { mapDifficulty } from '../utils/mappers';
import { useDurationFormatTimer } from '../hooks/use-duration-format-timer';
import { SongInfoLine } from './SongInfoLine';

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

    const items = [];
    if (difficulty) {
        items.push(<span className="difficulty">{mapDifficulty(difficulty)}</span>);
    }
    if (duration) {
        items.push(<span className="duration">{df.format(duration)}</span>);
    }
    if (star) {
        items.push(<span className="star">☆ {nf.format(star)}</span>);
    }
    if (pp) {
        items.push(<span className="pp">{nf.format(pp)}pp</span>);
    }
    if (bsr) {
        items.push(<span className="bsr">!bsr {mapDifficulty(bsr)}</span>);
    }

    if (items.length === 0) return null;

    return <SongInfoLine className="song-details">
        <span className="song-detail-items">
            {items}
        </span>
    </SongInfoLine>;
};
