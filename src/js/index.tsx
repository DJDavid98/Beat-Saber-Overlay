import { App } from "./App";
import { createRoot } from "react-dom/client";

const rootEl = document.getElementById('root');

if (!rootEl) {
    throw new Error('Root element is missing');
}

const root = createRoot(rootEl);
root.render(<App />);
