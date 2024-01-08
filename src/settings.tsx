import { mountAppComponent } from './js/utils/mount-app-component';
import { SettingsProvider } from './js/settings/SettingsProvider';

const params = new URLSearchParams();

const WrappedSettings = () => (
    <SettingsProvider queryParams={params} forceDialogOpen />
);

mountAppComponent('settings-root', WrappedSettings, {});
