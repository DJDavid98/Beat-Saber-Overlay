import { ChangeEventHandler, FC, useCallback, useId } from 'react';
import {
    isRemovableElementId,
    RemovableElementId,
    RemovableElementsTree
} from '../../model/removable-element-id';
import * as styles from '../../../scss/modules/ElementSettingsTree.module.scss';

export interface ElementSettingsTreeProps {
    tree: RemovableElementsTree;
    rootElementId: RemovableElementId;
    disabledElements: Set<RemovableElementId>;
    setElementEnabled: (element: RemovableElementId, enabled: boolean) => void;
    level?: number;
}

export const ElementSettingsTree: FC<ElementSettingsTreeProps> = ({ rootElementId, tree, disabledElements, setElementEnabled, level = 0 }) => {
    const meta = tree[rootElementId];
    const levelId = useId();
    const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        const { checked, dataset: { element } } = e.target;
        if (isRemovableElementId(element)) {
            setElementEnabled(element, checked);
        }
    }, [setElementEnabled]);
    return <div className={styles['element-settings-tree']} data-level={level}>
        {level > 0 && <>
            <div className={styles['meta']}>
                <input
                    id={levelId}
                    type="checkbox"
                    data-element={rootElementId}
                    checked={!disabledElements.has(rootElementId)}
                    onChange={handleChange}
                />
                <label htmlFor={levelId}>
                    <span>{meta.name}</span>
                    {meta.description && <p>{meta.description}</p>}
                </label>
            </div>
        </>}
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
