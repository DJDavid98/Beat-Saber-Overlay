import { RemovableElementId } from './removable-element-id';
import { BeatSaberDataSource } from '../beat-saber/BeatSaber';

export enum SettingName {
    PULSOID_TOKEN = 'pulsoidToken',
    HEART_RATE_WEBSOCKET_HOST = 'heartRateWebsocketHost',
    HEART_RATE_WEBSOCKET_PATH = 'heartRateWebsocketPath',
    DISABLED_ELEMENTS = 'disabledElements',
    CHAT_SOCKET_SERVER_URL = 'chatSocketServerUrl',
    CHAT_SOCKET_ROOM = 'chatSocketRoom',
    ELEVEN_LABS_TOKEN = 'elevenLabsToken',
    TTS_ENABLED = 'ttsEnabled',
    BEAT_SABER_DATA_SOURCE = 'beatSaberDataSource',
}

export interface SettingTypes {
    [SettingName.PULSOID_TOKEN]: string;
    [SettingName.HEART_RATE_WEBSOCKET_HOST]: string;
    [SettingName.HEART_RATE_WEBSOCKET_PATH]: string;
    [SettingName.DISABLED_ELEMENTS]: RemovableElementId[];
    [SettingName.CHAT_SOCKET_SERVER_URL]: string;
    [SettingName.CHAT_SOCKET_ROOM]: string;
    [SettingName.BEAT_SABER_DATA_SOURCE]: BeatSaberDataSource;
    [SettingName.ELEVEN_LABS_TOKEN]: string;
    [SettingName.TTS_ENABLED]: boolean;
}

export type SettingsObject = {
    [k in SettingName]: SettingTypes[k] | null;
};

export enum SettingsPage {
    ELEMENTS = 'elements',
    BEAT_SABER = 'beat-saber',
    HEART_RATE = 'heart-rate',
    CHANNEL_BUG = 'channel-bug',
    CHAT_OVERLAY = 'chat-overlay',
    BOUNCY = 'bouncy',
    IMPORT_EXPORT = 'import-export',
    CREDITS = 'credits',
}

export interface SettingsPageOptions {
    name: string;
    icon: string;
    disabled?: boolean;
}
