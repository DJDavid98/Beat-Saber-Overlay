import { FC, PropsWithChildren } from 'react';
import { CutieMarkPlayer } from './CutieMarkPlayer';

export const EventAlert: FC<PropsWithChildren> = ({ children }) => {
    return <div id="event-alert">
        <CutieMarkPlayer id="event-alert-icon" />
        <p id="event-alert-message">{children}</p>
    </div>;
};
