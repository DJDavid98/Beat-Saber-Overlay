import { createRoot, Root } from "react-dom/client";
import { RemountContextProvider } from "./remount-context";
import { FunctionComponent } from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
export const mountAppComponent = <P extends {}>(
    rootId: string,
    Component: FunctionComponent<P>,
    props: P,
    delayRemount?: number
) => {
    const appRootEl = document.getElementById(rootId);
    if (appRootEl) {
        let appRoot: Root | null = null;
        const remountApp = async () => {
            if (appRoot) {
                appRoot.unmount();
                appRoot = null;
                if (delayRemount && delayRemount > 0) {
                    // Wait for a bit before re-mounting, allows displaying a placeholder while the root is empty
                    await new Promise(res => setTimeout(res, delayRemount));
                }
            }

            appRoot = createRoot(appRootEl);
            appRoot.render(
                <RemountContextProvider value={{ remount: remountApp }}>
                    <Component {...props} />
                </RemountContextProvider>
            );
        }
        void remountApp();
    } else {
        throw new Error(`#${rootId} element is missing`);
    }
}
