/**
 * Returns whether the page is currently loaded inside an OBS Browser Source
 */
export const isInBrowserSource = () => 'obsstudio' in window;
