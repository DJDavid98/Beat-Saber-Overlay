import { FC, memo, MouseEventHandler, PropsWithChildren } from 'react';
import { RemovableElementId } from './model/removable-element-id';
import { useIsElementRemoved } from './contexts/removed-elements-context';

export interface RemovableElementProps extends PropsWithChildren {
    id: RemovableElementId;
    className?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
}

const RemovableElementComponent: FC<RemovableElementProps> = ({
    id,
    className,
    children,
    onClick
}) => {
    const removed = useIsElementRemoved(id);

    if (removed) return null;

    return <div id={id} className={className} onClick={onClick}>{children}</div>;
};

export const RemovableElement = memo(RemovableElementComponent);
