import { FunctionComponent } from 'react';
import { SongInfo } from './SongInfo';

export interface SongNameProps {
    name?: string,
    subName?: string
}

export const SongName: FunctionComponent<SongNameProps> = ({ name, subName }) => {
    return (
        <SongInfo className="song-name">
            <span className="main-name">{name}</span>
            {subName && <>{' '}<span className="sub-name">{subName}</span></>}
        </SongInfo>
    );
};
