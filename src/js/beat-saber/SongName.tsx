import { FunctionComponent } from 'react';
import { SongInfoLine } from './SongInfoLine';

export interface SongNameProps {
    name?: string,
    subName?: string
}

export const SongName: FunctionComponent<SongNameProps> = ({ name, subName }) => {
    return (
        <SongInfoLine className="song-name">
            <span className="main-name">{name}</span>
            {subName && <span className="sub-name">{subName}</span>}
        </SongInfoLine>
    );
};
