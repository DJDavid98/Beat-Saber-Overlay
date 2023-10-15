import { mountAppComponent } from './js/utils/mount-app-component';
import { App } from './js/App';
import { SettingsManager } from './js/settings/SettingsManager';

/**
 * Get the query parameters
 * https://stackoverflow.com/a/901144
 */
const params = new URLSearchParams(window.location.search);

const WrappedApp: typeof App = (props) => (
    <SettingsManager queryParams={params}>
        <App {...props} />
    </SettingsManager>
);

mountAppComponent('app-root', WrappedApp, {});
