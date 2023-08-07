import { FC } from 'react';
import { SongName, SongNameProps } from './SongName';
import { SongAuthor, SongAuthorProps } from './SongAuthor';
import { SongDetails } from './SongDetails';
import { SongCoverImage, CoverImageProps } from './SongCoverImage';
import { defaultCoverImage } from '../utils/constants';

export type SongInfoDisplayProps = SongNameProps & SongAuthorProps & SongDetails & CoverImageProps;

export const SongInfo: FC<SongInfoDisplayProps> = ({
    author,
    bsr,
    difficulty,
    duration,
    mapper,
    name,
    pp,
    star,
    subName,
    url,
}) => {
    return <>
        <div className="song-info-block">
            <SongName name={name} subName={subName} />
            <SongAuthor author={author} mapper={mapper} />
            <SongDetails
                difficulty={difficulty}
                bsr={bsr}
                star={star}
                duration={duration}
                pp={pp}
            />
        </div>
        <SongCoverImage url={url || defaultCoverImage} />
    </>;
};
