import { App } from "./js/App";
import { createRoot, Root } from "react-dom/client";
import { HeartRate } from "./js/heartrate/HeartRate";

const appRootEl = document.getElementById('app-root');
if (!appRootEl) {
    throw new Error('App root element is missing');
}

let appRoot: Root | null = null;
const remountApp = () => {
    if (appRoot) {
        appRoot.unmount();
        appRoot = null;
    }

    appRoot = createRoot(appRootEl);
    appRoot.render(<App remount={remountApp} />);
}
remountApp();


const heartRateRootEl = document.getElementById('heart-rate-root');
if (heartRateRootEl) {
    createRoot(heartRateRootEl).render(<HeartRate />);
} else {
    console.error('Heart rate root element is missing');
}
