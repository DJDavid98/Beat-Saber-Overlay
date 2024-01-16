import { IBodyRenderOptionsSprite } from 'matter-js';
import { NoteCutDirection } from '../model/bsdp';

const noteArrow = new URL(
    '../../img/note-arrow.png',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import.meta.url
);
const noteDot = new URL(
    '../../img/note-dot.png',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import.meta.url
);

export const getNoteSprite = (cutDirection: number): IBodyRenderOptionsSprite | undefined => {
    let texture: URL | undefined;
    switch (cutDirection) {
        case NoteCutDirection.Up:
        case NoteCutDirection.Down:
        case NoteCutDirection.Left:
        case NoteCutDirection.Right:
        case NoteCutDirection.UpRight:
        case NoteCutDirection.UpLeft:
        case NoteCutDirection.DownLeft:
        case NoteCutDirection.DownRight:
            texture = noteArrow;
            break;
        case NoteCutDirection.Any:
            texture = noteDot;
            break;
    }

    if (!texture) {
        return undefined;
    }
    return {
        xScale: 1,
        yScale: 1,
        texture: texture.toString(),
    };
};
