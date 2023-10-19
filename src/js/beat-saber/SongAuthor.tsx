import { FunctionComponent } from 'react';
import { SongInfoLine } from './SongInfoLine';

export interface SongAuthorProps {
    author?: string;
    mapper?: string
}

export const SongAuthor: FunctionComponent<SongAuthorProps> = ({ author, mapper }) => {
    if (!author && !mapper) return null;

    return (
        <SongInfoLine className="song-author">
            {author}
            {mapper && <>{' '}[<span className="mapper">{mapper}</span>]</>}
        </SongInfoLine>
    );
};
