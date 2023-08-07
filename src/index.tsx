import { mountAppComponent } from './js/utils/mount-app-component';
import { App } from './js/App';
import {
    RemovedElementsContextProvider,
    RemovedElementsContextType
} from './js/contexts/removled-elements-context';

/**
 * Get the query parameters
 * https://stackoverflow.com/a/901144
 */
const params = new URLSearchParams(window.location.search);

// Get list of removed elements
const disable = params.get('disable');
const removedElementIds: RemovedElementsContextType = {};
if (disable !== null) {
    disable.split(',').forEach(disabledId => {
        removedElementIds[disabledId] = true;
    });
}

const WrappedApp: typeof App = (props) => (
    <RemovedElementsContextProvider value={removedElementIds}>
        <App {...props} />
    </RemovedElementsContextProvider>
);

mountAppComponent('app-root', WrappedApp, { params });
