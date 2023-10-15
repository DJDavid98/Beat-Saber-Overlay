import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import {
    SettingsContextProvider,
    SettingsContextType
} from '../contexts/settings-context';
import {
    SettingName,
    SettingsObject,
    SettingsPage,
    SettingTypes
} from '../model/settings';
import { SettingsDialog } from './SettingsDialog';
import { isRemovableElementId, RemovableElementId } from '../model/removable-element-id';
import {
    RemovedElementsContextProvider,
    RemovedElementsContextType
} from '../contexts/removled-elements-context';
import {
    defaultSettings,
    isValidSettings,
    settingNames,
    settingValidators
} from '../utils/settings';
import { BeatSaberDataSource } from '../beat-saber/BeatSaber';

const legacySettingsMap: Record<string, SettingName> = {
    'websocket-host': SettingName.HEART_RATE_WEBSOCKET_HOST,
    'websocket-path': SettingName.HEART_RATE_WEBSOCKET_PATH,
    'pulsoid-token': SettingName.PULSOID_TOKEN,
};

const getSettingValue = <S extends SettingName>(settingName: S): SettingTypes[S] | null => {
    const rawValue = localStorage.getItem(settingName);
    if (rawValue !== null) {
        try {
            return JSON.parse(rawValue);
        } catch (e) {
            console.error(e);
        }
    }
    return null;
};

export interface SettingsManagerProps extends PropsWithChildren {
    queryParams: URLSearchParams;
}

export const SettingsManager: FC<SettingsManagerProps> = ({ queryParams, children }) => {
    const [settings, setSettings] = useState<SettingsObject>(defaultSettings);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogPage, setDialogPage] = useState<SettingsPage | undefined>();
    const setSetting: SettingsContextType['setSetting'] = useCallback((setting, value) => {
        if (value !== null) {
            const currentValue = localStorage.getItem(setting);
            const validatedValue = settingValidators[setting](value);
            const encodedValue = JSON.stringify(validatedValue);
            if (currentValue === null ? encodedValue !== null : currentValue !== encodedValue) {
                localStorage.setItem(setting, encodedValue);
            }
        } else {
            localStorage.removeItem(setting);
        }
        setSettings((lastSettings) => ({ ...lastSettings, [setting]: value }));
    }, []);
    const importSettings: SettingsContextType['importSettings'] = useCallback((data) => {
        try {
            const inputSettings = JSON.parse(atob(data));
            if (isValidSettings(inputSettings)) {
                Object.entries(inputSettings as SettingsObject).forEach(([setting, value]) => {
                    setSetting(setting as SettingName, value);
                });
                return true;
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    }, [setSetting]);
    const openSettings = useCallback((page?: SettingsPage) => {
        setDialogOpen(true);
        if (page) {
            setDialogPage(page);
        }
    }, []);
    const closeSettings = useCallback(() => {
        setDialogOpen(false);
    }, []);

    useEffect(() => {
        // Migrate legacy settings which are all strings
        Object.keys(legacySettingsMap).forEach(legacySetting => {
            const value = localStorage.getItem(legacySetting);
            if (value !== null) {
                setSetting(legacySettingsMap[legacySetting], value);
                localStorage.removeItem(legacySetting);
            }
        });

        // Process legacy disable query param
        const disableQueryParam = queryParams.get('disable');
        if (disableQueryParam) {
            const removedElementIds: Set<RemovableElementId> = new Set();
            disableQueryParam.split(',').forEach(disabledId => {
                if (isRemovableElementId(disabledId))
                    removedElementIds.add(disabledId);
            });
            if (removedElementIds.size > 0) {
                setSetting(SettingName.DISABLED_ELEMENTS, Array.from(removedElementIds));
            }
        }
        const socketQueryParam = queryParams.get('socket');
        if (socketQueryParam) {
            setSetting(SettingName.CHAT_SOCKET_SERVER_URL, socketQueryParam);
        }
        const roomQueryParam = queryParams.get('room');
        if (roomQueryParam) {
            setSetting(SettingName.CHAT_SOCKET_ROOM, roomQueryParam);
        }
        const sourceQueryParam = queryParams.get('source');
        if (sourceQueryParam) {
            setSetting(SettingName.BEAT_SABER_DATA_SOURCE, sourceQueryParam as BeatSaberDataSource);
        }

        // Read current settings
        settingNames.forEach((settingName) => {
            const value = getSettingValue(settingName);
            if (value !== null) {
                setSetting(settingName, value);
            }
        });
    }, [setSetting, queryParams]);

    const removedElementsContext: RemovedElementsContextType = useMemo(() => {
        const settingValue = settings[SettingName.DISABLED_ELEMENTS] ?? [];
        return settingValue.reduce((acc: RemovedElementsContextType, elementId) => ({
            ...acc,
            [elementId]: true,
        }), {});
    }, [settings]);
    const settingsContextValue = useMemo((): SettingsContextType => ({
        settings,
        setSetting,
        openSettings,
        closeSettings,
        importSettings,
    }), [closeSettings, importSettings, openSettings, setSetting, settings]);
    return <RemovedElementsContextProvider value={removedElementsContext}>
        <SettingsContextProvider value={settingsContextValue}>
            {children}
            <SettingsDialog isOpen={dialogOpen} page={dialogPage} close={closeSettings} />
        </SettingsContextProvider>
    </RemovedElementsContextProvider>;
};
