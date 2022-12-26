import { FunctionComponent, useMemo } from "react";
import DurationUnitFormat from "intl-unofficial-duration-unit-format";

const mapDifficulty = (difficulty?: string) => difficulty === 'ExpertPlus' ? 'Expert+' : difficulty;

export const SongDetails: FunctionComponent<{ difficulty?: string; bsr?: string | null; star?: number; pp?: number; duration?: number }> = ({
    difficulty,
    bsr,
    star,
    pp,
    duration
}) => {
    const nf = useMemo(() => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }), []);
    const df = useMemo(() => new DurationUnitFormat('en-US', { style: "timer" }), []);

    return <div id="song-details">
        {difficulty && <span className="difficulty">{mapDifficulty(difficulty)}</span>}
        {!!duration && <span className="duration">{df.format(duration)}</span>}
        {!!star && <span className="star">☆ {nf.format(star)}</span>}
        {!!pp && <span className="pp">{nf.format(pp)}pp</span>}
        {bsr && <span className="bsr">!bsr {mapDifficulty(bsr)}</span>}
    </div>;
}
