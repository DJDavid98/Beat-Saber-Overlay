import { FunctionComponent } from 'react';
import { SongInfo } from './SongInfo';

export interface SongAuthorProps {
    author?: string;
    mapper?: string
}

export const SongAuthor: FunctionComponent<SongAuthorProps> = ({ author, mapper }) => {
    return (
        <SongInfo className="song-author">
            {author}
            {mapper && <>{' '}[<span className="mapper">{mapper}</span>]</>}
        </SongInfo>
    );
};
