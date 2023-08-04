import { FunctionComponent, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { RemountContextProvider } from './utils/remount-context';

interface Props extends PropsWithChildren {
    rootId: string,
    delayRemount?: number
}

export const SmartRemountWrapper: FunctionComponent<Props> = ({
    rootId,
    delayRemount,
    children
}) => {
    const [rootMounted, setRootMounted] = useState(false);
    const remount = useMemo(() => ({ remount: () => setRootMounted(false) }), []);
    useEffect(() => {
        if (rootMounted) return;

        const mountedSetter = () => setRootMounted(true);
        if (!delayRemount) {
            mountedSetter();
            return;
        }

        // Wait for a bit before re-mounting, allows displaying a placeholder while the root is empty
        const timeout = setTimeout(mountedSetter, delayRemount);
        return () => clearTimeout(timeout);
    }, [delayRemount, rootMounted]);

    // keep
    return <div id={rootId}>{rootMounted && (
        <RemountContextProvider value={remount}>
            {children}
        </RemountContextProvider>
    )}</div>;
};
