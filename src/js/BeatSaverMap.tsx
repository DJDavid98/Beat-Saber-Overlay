import { FC, useMemo } from 'react';
import useSWR from 'swr';
import * as styles from '../scss/modules/BeatSaverMap.module.scss';
import { SongInfo } from './beat-saber/SongInfo';
import { validateBeatSaverMapData } from './validators/validate-beat-saver-map-data';
import classNames from 'classnames';
import { mapDifficulty } from './utils/mappers';

export interface BeatSaverMapProps {
    mapId: string;
    text?: string;
    inChat?: boolean;
}

export const BeatSaverMap: FC<BeatSaverMapProps> = ({ mapId, inChat }) => {
    const {
        data,
        isLoading
    } = useSWR(() => mapId ? `bsr-map-${mapId}` : null, () => fetch(`https://api.beatsaver.com/maps/id/${mapId}`).then(r => r.json()).then(data => validateBeatSaverMapData(data)), {
        revalidateOnFocus: false,
        refreshWhenHidden: false,
        refreshWhenOffline: false,
    });
    const versions = data?.versions;
    const publishedVersion = useMemo(() => versions?.slice().sort((a,
        b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).find(v => v.state === 'Published'), [versions]);
    return <div className={classNames(styles['beat-saver-map'], { [styles['in-chat']]: inChat })}>
        <div className={styles['beat-saver-song-info']}>
            <SongInfo
                name={data?.metadata?.songName ?? (isLoading ? '' : 'Unknown Song')}
                author={isLoading ? 'Loading map data…' : (data?.metadata?.songAuthorName ?? 'Unknown Artist')}
                duration={data?.metadata?.duration}
                mapper={data?.metadata?.levelAuthorName}
                subName={data?.metadata?.songSubName}
                url={publishedVersion?.coverURL}
                bsr={data?.id ?? mapId}
                difficulty={publishedVersion?.diffs?.filter(diff => diff.characteristic === 'Standard').map(diff => mapDifficulty(diff.difficulty)).join(', ')}
            />
        </div>
    </div>;
};
