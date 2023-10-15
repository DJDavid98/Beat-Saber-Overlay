import { FC, ReactNode, useEffect, useRef } from 'react';
import { SettingsPage } from '../model/settings';
import { settingPages, SettingsNavigation } from './SettingsNavigation';
import { SettingsPageElements } from './pages/SettingsPageElements';
import { SettingsPageHeartRate } from './pages/SettingsPageHeartRate';
import * as styles from '../../scss/modules/SettingsDialog.module.scss';
import { SettingsPageImportExport } from './pages/SettingsPageImportExport';
import { SettingsPageChatOverlay } from './pages/SettingsPageChatOverlay';
import { SettingsPageCredits } from './pages/SettingsPageCredits';

interface SettingsDialogProps {
    isOpen: boolean;
    page?: SettingsPage;
    close: VoidFunction;
}

export const SettingsDialog: FC<SettingsDialogProps> = ({
    page = SettingsPage.ELEMENTS,
    isOpen,
    close,
}) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!dialogRef.current) return;

        if (isOpen) {
            if (!dialogRef.current.open) {
                dialogRef.current.showModal();
            }
        } else {
            if (dialogRef.current.open) {
                dialogRef.current.close();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        dialogRef.current?.addEventListener('close', () => {
            close();
        });
    }, [close]);

    let settingsPage: ReactNode;
    // noinspection JSUnreachableSwitchBranches
    switch (page) {
        case SettingsPage.ELEMENTS:
            settingsPage = <SettingsPageElements />;
            break;
        case SettingsPage.HEART_RATE:
            settingsPage = <SettingsPageHeartRate />;
            break;
        case SettingsPage.IMPORT_EXPORT:
            settingsPage = <SettingsPageImportExport />;
            break;
        case SettingsPage.CHAT_OVERLAY:
            settingsPage = <SettingsPageChatOverlay />;
            break;
        case SettingsPage.CREDITS:
            settingsPage = <SettingsPageCredits />;
            break;
        default:
            settingsPage = <p><em>There are no settings in this section yet.</em></p>;
            break;
    }

    return <dialog className={styles['settings-dialog'] + ' '} ref={dialogRef} hidden={!isOpen}>
        <SettingsNavigation currentPage={page} />
        <div className={styles['settings-ui-wrap']}>
            <h1 className={styles['settings-header']}>
                <span className={styles['muted']}>Settings /</span>
                {` ${settingPages[page].name}`}
            </h1>
            {isOpen && settingsPage}
        </div>
        <div className={styles['close-button-wrap']}>
            <button className={styles['close-button']} type="button" onClick={close}>
                &times;
            </button>
        </div>
    </dialog>;
};
