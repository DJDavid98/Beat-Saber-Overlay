import { FC, useMemo } from 'react';
import { Modifiers } from './model/modifiers';

const modifierNames: Record<keyof Modifiers, string> = {
    disappearingArrows: 'Disappearing Arrows',
    fasterSong: 'Faster Song',
    fourLives: '4 Lives',
    ghostNotes: 'Ghost Notes',
    noArrows: 'No Arrows',
    noBombs: 'No Bombs',
    noFail: 'No Fail',
    noWalls: 'No Walls',
    oneLife: '1 Life',
    proMode: 'Pro Mode',
    slowerSong: 'Slower Song',
    smallNotes: 'Small Notes',
    strictAngles: 'Strict Angles',
    superFastSong: 'Super Fast Song',
    zenMode: 'Zen Mode',
};

export interface AdditionalDataModifiersProps {
    modifiers?: Modifiers;
}

export const AdditionalDataModifiers: FC<AdditionalDataModifiersProps> = ({ modifiers }) => {
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
            <span id="modifiers-label">Modifiers</span>
            <ul id="modifier-list">
                {modifierLabels.map(label => <li key={label}>{label}</li>)}
            </ul>
        </div>
    );
};
