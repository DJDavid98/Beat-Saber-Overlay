import {
    ChangeEventHandler,
    FC,
    FormEventHandler,
    useCallback,
    useEffect,
    useMemo, useRef,
    useState
} from 'react';
import { useSettings } from '../../contexts/settings-context';
import * as styles from '../../../scss/modules/SettingsPageImportExport.module.scss';

const textareaRows = 10;

export const SettingsPageImportExport: FC = () => {
    const { importSettings, settings } = useSettings();
    const [importInputValue, setImportInputValue] = useState('');
    const exportedSettings = useMemo(() => btoa(JSON.stringify(settings)), [settings]);
    const [importResult, setImportResult] = useState<null | boolean>(null);
    const [exportVisible, setExportVisible] = useState<boolean>(false);
    const firstInputRef = useRef<HTMLTextAreaElement>(null);
    const exportCodeRef = useRef<HTMLTextAreaElement>(null);

    const overwriteSettings: FormEventHandler = useCallback((e) => {
        e.preventDefault();

        setImportResult(importSettings(importInputValue));
    }, [importInputValue, importSettings]);
    const handleImportInputChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback((e) => {
        setImportInputValue(e.target.value);
    }, []);
    const handleExport = useCallback(() => {
        setExportVisible(true);
    }, []);
    const handleHideExport = useCallback(() => {
        setExportVisible(false);
    }, []);

    useEffect(() => {
        if (exportVisible) {
            exportCodeRef.current?.select();
        }
    }, [exportVisible]);

    // Used to reset the state of the page on mount/reset button click
    const init = useCallback(() => {
        firstInputRef.current?.focus();
    }, []);
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- This effect should only be called on mount
    }, []);

    return <form className={styles['import-form']} onSubmit={overwriteSettings}>
        <details open>
            <summary>
                <h2>Import</h2>
            </summary>

            <p>Paste the settings copied from this interface and click the button below to restore
                them</p>
            <textarea
                className="small"
                rows={textareaRows}
                value={importInputValue}
                onChange={handleImportInputChange}
                ref={firstInputRef}
            />
            {importResult !== null && <>
                {importResult
                    ? <p className={styles['import-success']}>Settings imported successfully</p>
                    : <p className={styles['import-error']}>Settings could not be imported</p>}
            </>}
            <button type="submit" disabled={!importInputValue}>Import</button>
        </details>

        <details open>
            <summary>
                <h2>Export</h2>
            </summary>

            <p>Click the button below to export your settings. This value can contain
                sensitive information, so do not click this while your screen is visible to
                others.</p>
            <button type="button" onClick={handleExport} disabled={exportVisible}>
                Export Settings
            </button>

            {exportVisible && <div className={styles['export-output']}>
                <p>Copy the text below below and paste it into the box above wherever you want to
                    transfer your settings to</p>
                <textarea
                    className={`small ${styles['export-code']}`}
                    rows={textareaRows}
                    readOnly
                    value={exportedSettings}
                    ref={exportCodeRef}
                />
                <button type="button" onClick={handleHideExport}>Hide</button>
            </div>}
        </details>
    </form>;
};
