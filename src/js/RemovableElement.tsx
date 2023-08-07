import { FC, memo, PropsWithChildren } from 'react';
import { RemovableElementId } from './model/removable-element-id';
import { useIsElementRemoved } from './contexts/removled-elements-context';

export interface RemovableElementProps extends PropsWithChildren {
    id: RemovableElementId;
    className?: string
}

const RemovableElementComponent: FC<RemovableElementProps> = ({ id, className, children }) => {
    const removed = useIsElementRemoved(id);

    if (removed) return null;

    return <div id={id} className={className}>{children}</div>;
};

export const RemovableElement = memo(RemovableElementComponent);
