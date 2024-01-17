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
        xScale: 0.3,
        yScale: 0.3,
        texture: texture.toString(),
    };
};

import { Body, Render as MatterRender } from 'matter-js';

/**
 * Gets the requested texture (an Image) via its path
 */
const getTexture = function (render: MatterRender, imagePath: string): HTMLImageElement {
    let image = render.textures[imagePath];

    if (image)
        return image;

    image = render.textures[imagePath] = new Image();
    image.src = imagePath;

    return image;
};

export const Render = Object.assign(MatterRender, {
    bodies(render: MatterRender, bodies: Body[], context: CanvasRenderingContext2D) {
        const c = context;
        const options = render.options;
        const showInternalEdges = options.showInternalEdges || !options.wireframes;

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];

            if (!body.render.visible)
                continue;

            // handle compound parts
            for (let k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                const part = body.parts[k];

                if (!part.render.visible)
                    continue;

                if (typeof part.render.opacity === 'number') {
                    if (options.showSleeping && body.isSleeping) {
                        c.globalAlpha = 0.5 * part.render.opacity;
                    } else if (part.render.opacity !== 1) {
                        c.globalAlpha = part.render.opacity;
                    }
                }

                // part polygon
                if (part.circleRadius) {
                    c.beginPath();
                    c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
                } else {
                    c.beginPath();
                    c.moveTo(part.vertices[0].x, part.vertices[0].y);

                    for (let j = 1; j < part.vertices.length; j++) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                            c.lineTo(part.vertices[j].x, part.vertices[j].y);
                        } else {
                            c.moveTo(part.vertices[j].x, part.vertices[j].y);
                        }

                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if (part.vertices[j].isInternal && !showInternalEdges) {
                            c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                        }
                    }

                    c.lineTo(part.vertices[0].x, part.vertices[0].y);
                    c.closePath();
                }

                if (!options.wireframes) {
                    if (part.render.fillStyle) {
                        c.fillStyle = part.render.fillStyle;
                    }

                    if (part.render.lineWidth) {
                        c.lineWidth = part.render.lineWidth;
                        if (part.render.strokeStyle) {
                            c.strokeStyle = part.render.strokeStyle;
                        }
                        c.stroke();
                    }

                    c.fill();
                } else {
                    c.lineWidth = 1;
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    c.strokeStyle = render.options.wireframeStrokeStyle;
                    c.stroke();
                }

                const sprite = part.render.sprite;
                if (sprite && sprite.texture && !options.wireframes) {
                    // part sprite
                    const texture = getTexture(render, sprite.texture);

                    c.translate(part.position.x, part.position.y);
                    c.rotate(part.angle);

                    c.drawImage(
                        texture,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        texture.width * -sprite.xOffset * sprite.xScale,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        texture.height * -sprite.yOffset * sprite.yScale,
                        texture.width * sprite.xScale,
                        texture.height * sprite.yScale
                    );

                    // revert translation, hopefully faster than save / restore
                    c.rotate(-part.angle);
                    c.translate(-part.position.x, -part.position.y);
                }

                c.globalAlpha = 1;
            }
        }
    }
});
