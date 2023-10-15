import { isInBrowserSource } from './utils/is-in-browser-source';
import { FC, useCallback } from 'react';
import { RemovableElement } from './RemovableElement';
import { RemovableElementId } from './model/removable-element-id';
import { useSettings } from './contexts/settings-context';
import { SettingsPage } from './model/settings';
import * as styles from '../scss/modules/AppBackground.module.scss';

/**
 * Render a background element for real browsers and not OBS browser sources
 */
export const AppBackground: FC = () => {
    const { openSettings } = useSettings();

    const openElementSettings = useCallback(() => {
        openSettings(SettingsPage.ELEMENTS);
    }, [openSettings]);

    if (isInBrowserSource()) return null;

    return <RemovableElement
        id={RemovableElementId.BACKGROUND}
        className={styles['background']}
        onClick={openElementSettings}
    />;
};
