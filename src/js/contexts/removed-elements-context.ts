import { createContext, useContext } from 'react';
import { RemovableElementId } from '../model/removable-element-id';

export type RemovedElementsContextType = Partial<Record<RemovableElementId | string, true>>;

const RemovedElementsContext = createContext<RemovedElementsContextType>({});

export const RemovedElementsContextProvider = RemovedElementsContext.Provider;
export const useIsElementRemoved = (id: string) => useContext(RemovedElementsContext)[id] === true;
