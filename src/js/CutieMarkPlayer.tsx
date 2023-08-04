import Lottie from 'react-lottie-player';
import cmLottie from './animations/cm-lottie.json';
import { FC, memo } from 'react';

interface PropTypes {
    id?: string;
    size?: number;
    speed?: number;
    loop?: boolean;
}

const CutieMarkPlayerComponent: FC<PropTypes> = ({ id, speed = 1, loop = false }) => (
    <Lottie
        id={id}
        play
        loop={loop}
        animationData={cmLottie}
        speed={speed}
    />
);

export const CutieMarkPlayer = memo(CutieMarkPlayerComponent);
