import { FC, memo } from "react";

type LoaderIds = 'websocket-loading' | 'heart-rate-loading' | 'ble-loading' | 'pulsoid-loading' | 'connection-loading'

const LoadingComponent: FC<{ id?: LoaderIds }> = ({ id }) => <div id={id} />;

export const Loading = memo(LoadingComponent);
