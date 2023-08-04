import { mountAppComponent } from './js/utils/mount-app-component';
import { App } from './js/App';

/**
 * Get the query parameters
 * https://stackoverflow.com/a/901144
 */
const params = new URLSearchParams(window.location.search);

mountAppComponent('app-root', App, { params });
