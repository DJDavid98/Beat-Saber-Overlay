import { useEffect, useState } from 'react';
import { throttle } from 'throttle-debounce';

export interface ScreenSizeData {
    width: number;
    height: number;
}

export const useCurrentScreenSize = (): ScreenSizeData => {
    const [screenSizeData, setScreenSizeData] = useState<ScreenSizeData>({ width: 0, height: 0 });

    useEffect(() => {
        const updateScreenSize = throttle(200, () => {
            setScreenSizeData({ width: window.innerWidth, height: window.innerHeight });
        });

        updateScreenSize();
        window.addEventListener('resize', updateScreenSize, { passive: true });
        return () => {
            window.removeEventListener('resize', updateScreenSize);
        };
    }, []);

    return screenSizeData;
};
