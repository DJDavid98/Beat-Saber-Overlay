import { FunctionComponent } from 'react';

export interface CoverImageProps {
    url?: string
}

export const SongCoverImage: FunctionComponent<CoverImageProps> = ({ url }) => {
    return <img className="song-cover-image" src={url} alt="" />;
};
