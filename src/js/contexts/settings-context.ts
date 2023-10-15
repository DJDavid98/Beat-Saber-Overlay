import { createContext, useContext } from 'react';
import { SettingName, SettingsObject, SettingsPage, SettingTypes } from '../model/settings';
import { defaultSettings } from '../utils/settings';

export type SettingsContextType = {
    settings: SettingsObject;
    setSetting: <S extends SettingName>(name: S, value: SettingTypes[S] | null) => void;
    openSettings: (page?: SettingsPage) => void;
    closeSettings: VoidFunction;
    importSettings: (data: string) => boolean;
};

const defaultValue: SettingsContextType = {
    settings: defaultSettings,
    setSetting: () => {
        throw new Error('setSetting function is not provided');
    },
    openSettings: () => {
        throw new Error('openSettings function is not provided');
    },
    closeSettings: () => {
        throw new Error('closeSettings function is not provided');
    },
    importSettings: () => {
        throw new Error('importSettings function is not provided');
    },
};
const SettingsContext = createContext<SettingsContextType>(defaultValue);

export const SettingsContextProvider = SettingsContext.Provider;
export const useSettings = () => useContext(SettingsContext);
