import { FC, memo, PropsWithChildren, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Marquee from 'react-fast-marquee';

export interface SongInfoProps extends PropsWithChildren {
    className: string;
}

/**
 * Wrapper component for all song info rows, for later use to detect overflow and apply marquee
 */
const SongInfoLineComponent: FC<SongInfoProps> = ({ className, children }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const originalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const divElement = originalRef.current;
        if (!divElement) return;

        const handleResize = () => {
            const { scrollWidth, clientWidth } = divElement;
            setIsOverflowing(scrollWidth > clientWidth);
        };

        const resizeObserver = new ResizeObserver(handleResize);

        resizeObserver.observe(divElement);
        window.addEventListener('resize', handleResize);

        return () => {
            resizeObserver.unobserve(divElement);
            window.removeEventListener('resize', handleResize);
        };
    }, [className]);

    return (
        <div className={classNames('song-info-line', className)}>
            <div
                className={classNames('song-info-line-original', { hide: isOverflowing })}
                ref={originalRef}
            >
                {children}
            </div>
            {isOverflowing && (
                <Marquee
                    className="song-info-line-marquee"
                    play={isOverflowing}
                >
                    <div className="song-info-line-marquee-item">{children}</div>
                </Marquee>
            )}
        </div>
    );
};

export const SongInfoLine = memo(SongInfoLineComponent);
