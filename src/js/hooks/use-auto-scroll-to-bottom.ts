import { RefObject, useEffect, useRef } from 'react';

export const useAutoScrollToBottom = <Element extends HTMLElement>(): RefObject<Element> => {
    const targetRef = useRef<Element>(null);

    useEffect(() => {
        const targetNode = targetRef.current;

        if (!targetNode) return;

        const observer = new MutationObserver(() => {
            targetNode.scrollTo({ top: targetNode.scrollHeight, left: 0, behavior: 'smooth' });
        });

        const observerOptions = {
            childList: true,
            subtree: true,
        };

        observer.observe(targetNode, observerOptions);

        return () => {
            observer.disconnect();
        };
    }, []);

    return targetRef;
};
