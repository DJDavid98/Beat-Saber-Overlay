import { FC, memo, MouseEventHandler } from "react";

type LoaderIds = 'websocket-loading' | 'heart-rate-loading' | 'ble-loading' | 'pulsoid-loading' | 'connection-loading'

const LoadingComponent: FC<{ id?: LoaderIds, onClick?: MouseEventHandler<HTMLDivElement> }> = ({ id, onClick }) => <div
    id={id}
    onClick={onClick}
/>;

export const Loading = memo(LoadingComponent);
