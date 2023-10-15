import { useSettings } from '../contexts/settings-context';
import { FC, useCallback } from 'react';
import { SettingsPage } from '../model/settings';
import { RemovableElementId } from '../model/removable-element-id';
import { RemovableElement } from '../RemovableElement';
import { Chat } from './Chat';

export const ChatWrapper: FC = () => {
    const { openSettings } = useSettings();

    const openChatSettings = useCallback(() => {
        openSettings(SettingsPage.CHAT_OVERLAY);
    }, [openSettings]);

    return <RemovableElement id={RemovableElementId.CHAT} onClick={openChatSettings}>
        <Chat />
    </RemovableElement>;
};
