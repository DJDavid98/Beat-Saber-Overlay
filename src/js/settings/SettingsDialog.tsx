import { FC, useEffect, useRef } from 'react';
import { SettingsPage } from '../model/settings';
import { settingPages, SettingsNavigation } from './SettingsNavigation';
import * as styles from '../../scss/modules/SettingsDialog.module.scss';

interface SettingsDialogProps {
    isOpen: boolean;
    page?: SettingsPage;
    close: VoidFunction | undefined;
}

const FallbackSettingsPage: FC = () => <p><em>There are no settings in this section yet.</em></p>;

export const SettingsDialog: FC<SettingsDialogProps> = ({
    page = SettingsPage.ELEMENTS,
    isOpen,
    close,
}) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const forceOpen = typeof close === 'undefined';

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
            close?.();
        });
    }, [close]);

    const SettingsPage = settingPages[page].component ?? FallbackSettingsPage;

    return <dialog
        className={styles['settings-dialog'] + (forceOpen ? ` ${styles['full-size']}` : '')}
        ref={dialogRef}
        hidden={!isOpen}
    >
        <SettingsNavigation currentPage={page} />
        <div className={styles['settings-ui-wrap']}>
            <h1 className={styles['settings-header']}>
                <span className={styles['muted']}>Settings /</span>
                {` ${settingPages[page].name}`}
            </h1>
            {isOpen && <SettingsPage />}
        </div>
        {!forceOpen && (
            <div className={styles['close-button-wrap']}>
                <button
                    className={styles['close-button']}
                    type="button"
                    onClick={close}
                >
                    &times;
                </button>
            </div>
        )}
    </dialog>;
};
