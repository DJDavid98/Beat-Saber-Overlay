import { createContext, useContext } from "react";

export interface AppContext {
    remount: VoidFunction;
}

const appContext = createContext<AppContext>({ remount: () => undefined })

export const AppContextProvider = appContext.Provider;
export const useAppContext = () => useContext(appContext);
