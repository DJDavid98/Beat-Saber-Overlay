import { App } from "./App";
import { createRoot, Root } from "react-dom/client";
import { HeartRate } from "./HeartRate";

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
    let heartRateRoot = createRoot(heartRateRootEl);
    heartRateRoot.render(<HeartRate />);
} else {
    console.error('Heart rate root element is missing');
}


const bgColorInput = document.getElementById("bg-color-input") as HTMLInputElement | null;
const colorStorageKey = 'bg-color';
if (bgColorInput) {
    const fallbackBgColor = '#000000';
    let currentBgColor = localStorage.getItem(colorStorageKey);
    const setBgColor = (updateInputValue = false) => {
        document.body.style.backgroundColor = currentBgColor ?? fallbackBgColor;
        if (updateInputValue) {
            bgColorInput.value = currentBgColor ?? fallbackBgColor;
        }
    };
    setBgColor(true);
    bgColorInput.addEventListener('change', () => {
        currentBgColor = bgColorInput.value;
        setBgColor();
        localStorage.setItem(colorStorageKey, currentBgColor);
    });
}
