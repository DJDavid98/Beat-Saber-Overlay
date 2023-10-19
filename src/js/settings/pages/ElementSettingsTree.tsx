import { ChangeEventHandler, FC, useCallback } from 'react';
import {
    isRemovableElementId,
    RemovableElementId,
    RemovableElementsTree
} from '../../model/removable-element-id';
import * as styles from '../../../scss/modules/ElementSettingsTree.module.scss';
import { LabelledInput } from '../LabelledInput';

export interface ElementSettingsTreeProps {
    tree: RemovableElementsTree;
    rootElementId: RemovableElementId;
    disabledElements: Set<RemovableElementId>;
    setElementEnabled: (element: RemovableElementId, enabled: boolean) => void;
    level?: number;
}

export const ElementSettingsTree: FC<ElementSettingsTreeProps> = ({
    rootElementId,
    tree,
    disabledElements,
    setElementEnabled,
    level = 0
}) => {
    const meta = tree[rootElementId];
    const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        const { checked, value } = e.target;
        if (isRemovableElementId(value)) {
            setElementEnabled(value, checked);
        }
    }, [setElementEnabled]);
    return <div className={styles['element-settings-tree']} data-level={level}>
        {level > 0 && <LabelledInput
            type="checkbox"
            value={rootElementId}
            checked={!disabledElements.has(rootElementId)}
            onChange={handleChange}
            displayName={meta.name}
        >
            {meta.description && <p>{meta.description}</p>}
        </LabelledInput>}
        {meta.children?.map(childId => <ElementSettingsTree
            key={childId}
            tree={tree}
            rootElementId={childId}
            disabledElements={disabledElements}
            setElementEnabled={setElementEnabled}
            level={level + 1}
        />)}
    </div>;
};
