import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { elementsTree, RemovableElementId } from '../../model/removable-element-id';
import { useSettings } from '../../contexts/settings-context';
import { SettingName } from '../../model/settings';
import { ElementSettingsTree, ElementSettingsTreeProps } from './ElementSettingsTree';

export const SettingsPageElements: FC = () => {
    const {
        settings: {
            [SettingName.DISABLED_ELEMENTS]: disabled
        },
        setSetting
    } = useSettings();
    const formRef = useRef<HTMLFormElement>(null);
    const disabledElementsSet = useMemo(() => new Set(disabled), [disabled]);
    const setElementEnabled: ElementSettingsTreeProps['setElementEnabled'] = useCallback((changedId,
        newEnabled) => {
        let newDisabled: RemovableElementId[];
        if (newEnabled) {
            if (!disabled) return;

            newDisabled = disabled.filter(disabledId => disabledId !== changedId);
        } else {
            newDisabled = disabled ? [...disabled, changedId] : [changedId];
        }
        setSetting(SettingName.DISABLED_ELEMENTS, newDisabled);
    }, [disabled, setSetting]);

    useEffect(() => {
        const firstInput = formRef.current?.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }, []);

    return <form ref={formRef}>
        <p>This area allows you to customize the elements you see in the overlay. The value of
            the <code>disable</code> query parameter overwrites these settings on each page load. If
            you want to preserve your settings, load the overlay without that parameter.</p>
        <ElementSettingsTree
            tree={elementsTree}
            rootElementId={RemovableElementId.APP}
            disabledElements={disabledElementsSet}
            setElementEnabled={setElementEnabled}
        />
    </form>;
};
