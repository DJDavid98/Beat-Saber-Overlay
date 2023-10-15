import { FC } from 'react';
import { SettingsPage, SettingsPageOptions } from '../model/settings';
import { useSettings } from '../contexts/settings-context';
import * as styles from '../../scss/modules/SettingsNavigation.module.scss';
import classNames from 'classnames';

// TODO More sophisticated iconography
export const settingPages: Record<SettingsPage, SettingsPageOptions> = {
    [SettingsPage.ELEMENTS]: {
        name: 'Elements',
        icon: '👁️'
    },
    [SettingsPage.BEAT_SABER]: {
        name: 'Beat Saber',
        icon: '🔽',
        disabled: true,
    },
    [SettingsPage.HEART_RATE]: {
        name: 'Heart Rate',
        icon: '❤️'
    },
    [SettingsPage.CHANNEL_BUG]: {
        name: 'Channel Bug',
        icon: '🐞',
        disabled: true,
    },
    [SettingsPage.CHAT_OVERLAY]: {
        name: 'Chat Overlay',
        icon: '💬',
    },
    [SettingsPage.BOUNCY]: {
        name: 'Bouncy',
        icon: '🏀',
        disabled: true,
    },
    [SettingsPage.IMPORT_EXPORT]: {
        name: 'Import / Export',
        icon: '💾',
    },
    [SettingsPage.CREDITS]: {
        name: 'Credits',
        icon: 'ℹ️',
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
                disabled={pageOptions.disabled}
            >
                {pageOptions.icon}&nbsp;{pageOptions.name}
            </button>;
        })}
    </nav>;
};
