import * as styles from '../../scss/modules/LabelledInput.module.scss';
import {
    ChangeEventHandler,
    forwardRef,
    ForwardRefRenderFunction,
    PropsWithChildren,
    useId
} from 'react';

export interface LabelledInputProps extends PropsWithChildren {
    type: 'checkbox' | 'radio';
    name?: string;
    value?: string;
    checked?: boolean;
    displayName: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

const LabelledInputComponent: ForwardRefRenderFunction<HTMLInputElement, LabelledInputProps> = ({
    type,
    name,
    value,
    checked,
    displayName,
    children,
    onChange
}, ref) => {
    const id = useId();
    return <div className={styles['labelled-input']}>
        <input
            id={id}
            type={type}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            ref={ref}
        />
        <label htmlFor={id}>
            <span>{displayName}</span>
            {children}
        </label>
    </div>;
};

export const LabelledInput = forwardRef(LabelledInputComponent);
