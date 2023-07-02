import { createContext, useContext } from 'react';

export interface RemountContext {
    remount: VoidFunction;
}

const RemountContext = createContext<RemountContext>({
    remount: () => {
        throw new Error('remount is called without providing RemountContext');
    }
});

export const RemountContextProvider = RemountContext.Provider;
export const useRemountContext = () => useContext(RemountContext);
