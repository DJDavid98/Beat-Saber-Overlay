import { FC, memo, PropsWithChildren } from 'react';

export interface SongInfoProps extends PropsWithChildren {
    className: string;
}

/**
 * Wrapper component for all song info rows, for later use to detect overflow and apply marquee
 */
const SongInfoComponent: FC<SongInfoProps> = ({ className, children }) => {
    return <div className={className}>{children}</div>;
};

export const SongInfo = memo(SongInfoComponent);
