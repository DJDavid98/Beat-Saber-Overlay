import { FC } from 'react';
import { SongName, SongNameProps } from './SongName';
import { SongAuthor, SongAuthorProps } from './SongAuthor';
import { SongDetails } from './SongDetails';
import { CoverImage, CoverImageProps } from './CoverImage';
import { defaultCoverImage } from '../utils/constants';

export type SongInfoDisplayProps = SongNameProps & SongAuthorProps & SongDetails & CoverImageProps;

export const SongInfoDisplay: FC<SongInfoDisplayProps> = ({
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
        <div>
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
        <CoverImage url={url || defaultCoverImage} />
    </>;
};
