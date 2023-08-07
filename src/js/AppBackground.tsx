import { isInBrowserSource } from './utils/is-in-browser-source';
import { FC } from 'react';
import { RemovableElement } from './RemovableElement';
import { RemovableElementId } from './model/removable-element-id';

/**
 * Render a background element for real browsers and not OBS browser sources
 */
export const AppBackground: FC = () => {
    if (isInBrowserSource()) return null;

    return <RemovableElement id={RemovableElementId.BACKGROUND} />;
};
