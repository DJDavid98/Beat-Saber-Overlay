import { FC, useMemo } from "react";
import { Modifiers } from "./utils/validate-map-data";

const modifierNames: Record<keyof Modifiers, string> = {
    DisappearingArrows: 'Disappearing Arrows',
    FasterSong: 'Faster Song',
    FourLives: '4 Lives',
    GhostNotes: 'Ghost Notes',
    NoArrows: 'No Arrows',
    NoBombs: 'No Bombs',
    NoFailOn0Energy: 'No Fail',
    NoWalls: 'No Walls',
    OneLife: '1 Life',
    ProMode: 'Pro Mode',
    SlowerSong: 'Slower Song',
    SmallNotes: 'Small Notes',
    StrictAngles: 'Strict Angles',
    SuperFastSong: 'Super Fast Song',
    ZenMode: 'Zen Mode',
};

export const AdditionalDataModifiers: FC<{ modifiers?: Modifiers }> = ({ modifiers }) => {
    const modifierLabels = useMemo(() => {
        if (!modifiers) return [];

        const modifierKeys = Object.keys(modifiers) as Array<keyof typeof modifiers>;
        return modifierKeys.reduce(
            (keys, key) => modifiers[key] ? [...keys, modifierNames[key]] : keys,
            [] as string[]
        );
    }, [modifiers]);

    if (modifierLabels.length === 0) {
        return null;
    }

    return (
        <div>
            <span className="additional-data-label">Modifiers</span>
            <ul id="modifier-list">
                {modifierLabels.map(label => <li key={label}>{label}</li>)}
            </ul>
        </div>
    );
}
