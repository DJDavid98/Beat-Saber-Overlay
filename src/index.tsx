import { mountAppComponent } from './js/utils/mount-app-component';
import { App } from './js/App';
import { SettingsProvider } from './js/settings/SettingsProvider';

/**
 * Get the query parameters
 * https://stackoverflow.com/a/901144
 */
const params = new URLSearchParams(window.location.search);

const WrappedApp: typeof App = (props) => (
    <SettingsProvider queryParams={params}>
        <App {...props} />
    </SettingsProvider>
);

mountAppComponent('app-root', WrappedApp, {});
