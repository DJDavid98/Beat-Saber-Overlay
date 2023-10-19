import { FC } from 'react';
import { SettingsPage, SettingsPageOptions } from '../model/settings';
import { useSettings } from '../contexts/settings-context';
import * as styles from '../../scss/modules/SettingsNavigation.module.scss';
import classNames from 'classnames';
import { SettingsPageElements } from './pages/SettingsPageElements';
import { SettingsPageBeatSaber } from './pages/SettingsPageBeatSaber';
import { SettingsPageHeartRate } from './pages/SettingsPageHeartRate';
import { SettingsPageChatOverlay } from './pages/SettingsPageChatOverlay';
import { SettingsPageImportExport } from './pages/SettingsPageImportExport';
import { SettingsPageObsIntegration } from './pages/SettingsPageObsIntegration';
import { SettingsPageCredits } from './pages/SettingsPageCredits';

// TODO More sophisticated iconography
export const settingPages: Record<SettingsPage, SettingsPageOptions> = {
    [SettingsPage.ELEMENTS]: {
        name: 'Elements',
        icon: '👁️',
        component: SettingsPageElements,
    },
    [SettingsPage.BEAT_SABER]: {
        name: 'Beat Saber',
        icon: '🔽',
        component: SettingsPageBeatSaber,
    },
    [SettingsPage.HEART_RATE]: {
        name: 'Heart Rate',
        icon: '❤️',
        component: SettingsPageHeartRate,
    },
    [SettingsPage.CHANNEL_BUG]: {
        name: 'Channel Bug',
        icon: '🐞',
    },
    [SettingsPage.CHAT_OVERLAY]: {
        name: 'Chat Overlay',
        icon: '💬',
        component: SettingsPageChatOverlay,
    },
    [SettingsPage.BOUNCY]: {
        name: 'Bouncy',
        icon: '🏀',
    },
    [SettingsPage.IMPORT_EXPORT]: {
        name: 'Import / Export',
        icon: '💾',
        component: SettingsPageImportExport,
    },
    [SettingsPage.OBS_INTEGRATION]: {
        name: 'OBS Integration',
        icon: '🔴',
        component: SettingsPageObsIntegration,
    },
    [SettingsPage.CREDITS]: {
        name: 'Credits',
        icon: 'ℹ️',
        component: SettingsPageCredits,
    },
};
export const settingsPageNames = Object.keys(settingPages) as SettingsPage[];

export const SettingsNavigation: FC<{ currentPage: SettingsPage }> = ({ currentPage }) => {
    const { openSettings } = useSettings();
    return <nav className={styles['settings-navigation']}>
        {settingsPageNames.map(pageName => {
            const pageOptions = settingPages[pageName];
            const current = currentPage === pageName;
            return <button
                className={classNames(styles['nav-button'], { [styles['nav-current']]: current })}
                key={pageName}
                onClick={() => openSettings(pageName)}
                disabled={!pageOptions.component}
            >
                {pageOptions.icon}&nbsp;{pageOptions.name}
            </button>;
        })}
    </nav>;
};
