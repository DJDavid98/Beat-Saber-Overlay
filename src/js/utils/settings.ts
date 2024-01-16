import { isRemovableElementId } from '../model/removable-element-id';
import { SettingName, SettingsObject, SettingTypes } from '../model/settings';
import { isValidBeatSaberDataSource } from '../beat-saber/BeatSaber';

export const settingValidators: { [k in SettingName]: (input: unknown) => SettingTypes[k] | null } = {
    [SettingName.PULSOID_TOKEN]: (input) => {
        if (typeof input === 'string' && /^[a-f\d-]+$/.test(input)) {
            return input;
        }
        return null;
    },
    [SettingName.HEART_RATE_WEBSOCKET_HOST]: input => {
        if (typeof input === 'string' && /^wss?:\/\/.+$/.test(input)) {
            return input;
        }
        return null;
    },
    [SettingName.HEART_RATE_WEBSOCKET_PATH]: input => {
        if (typeof input === 'string' && /^[a-z\d_.-]+$/.test(input)) {
            return input;
        }
        return null;
    },
    [SettingName.DISABLED_ELEMENTS]: input => {
        if (Array.isArray(input) && input.length > 0 && input.every(item => typeof item === 'string' && isRemovableElementId(item))) {
            return input;
        }
        return null;
    },
    [SettingName.CHAT_SOCKET_SERVER_URL]: input => {
        if (typeof input === 'string' && /^(http|ws)s?:\/\/.*$/.test(input)) {
            return input;
        }
        return null;
    },
    [SettingName.CHAT_SOCKET_ROOM]: input => {
        if (typeof input === 'string' && /^[a-z\d_-]+$/.test(input)) {
            return input;
        }
        return null;
    },
    [SettingName.BEAT_SABER_DATA_SOURCE]: input => {
        if (typeof input === 'string' && isValidBeatSaberDataSource(input)) {
            return input;
        }
        return null;
    },
    [SettingName.BEAT_SABER_BASE_FONT_SIZE]: input => {
        if (typeof input === 'number' && isFinite(input) && !isNaN(input) && input > 0) {
            return input;
        }
        return null;
    },
    [SettingName.BEAT_SABER_NOTES_PILE_ENABLED]: input => {
        if (typeof input === 'boolean') {
            return input;
        }
        return null;
    },
    [SettingName.ELEVEN_LABS_TOKEN]: input => {
        if (typeof input === 'string' && /^[a-f\d]+$/.test(input)) {
            return input;
        }
        return null;
    },
    [SettingName.TTS_ENABLED]: input => {
        if (typeof input === 'boolean') {
            return input;
        }
        return null;
    },
    [SettingName.OBS_PRIMARY_SCENE]: input => {
        if (typeof input === 'string') {
            return input;
        }
        return null;
    },
    [SettingName.OBS_BRB_SCENE]: input => {
        if (typeof input === 'string') {
            return input;
        }
        return null;
    },
    [SettingName.OBS_FAREWELL_SCENE]: input => {
        if (typeof input === 'string') {
            return input;
        }
        return null;
    },
    [SettingName.OUTRO_SONG_BSR]: input => {
        if (typeof input === 'string' && /^[a-f\d]+$/i.test(input)) {
            return input.toLowerCase();
        }
        return null;
    },
    [SettingName.CHAT_SONG_PREVIEWS]: input => {
        if (typeof input === 'boolean') {
            return input;
        }
        return null;
    }
};

export const isSettingName = (value: string): value is SettingName => value in settingValidators;
export const settingNames = Object.keys(settingValidators) as SettingName[];

export const isValidSettings = (input: unknown): input is SettingsObject => {
    if (typeof input !== 'object' || input === null) {
        console.error('input is not an object');
        return false;
    }

    for (const key in input) {
        if (!Object.prototype.hasOwnProperty.call(input, key)) continue;

        if (!isSettingName(key)) {
            return false;
        }
    }

    return true;
};
export const defaultSettings = settingNames.reduce((acc, settingName) => ({
    ...acc,
    [settingName]: null
}), {} as Record<keyof SettingsObject, null>);
