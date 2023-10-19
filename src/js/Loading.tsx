import { FC, memo, MouseEventHandler } from 'react';
import classNames from 'classnames';

type LoaderName =
    'websocket'
    | 'heart-rate'
    | 'ble'
    | 'pulsoid'
    | 'connection'
    | 'beat-saver-map'

type LoaderClass = `${LoaderName}-loading`;

const getLoaderClass = (name?: LoaderName): LoaderClass | undefined => name ? `${name}-loading` : undefined;

const LoadingComponent: FC<{
    name?: LoaderName,
    onClick?: MouseEventHandler<HTMLDivElement>
}> = ({
    name,
    onClick
}) => <div
    className={classNames(`loading-indicator`, getLoaderClass(name))}
    onClick={onClick}
/>;

export const Loading = memo(LoadingComponent);
