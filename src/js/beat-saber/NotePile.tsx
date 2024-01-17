import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataDisplayProps } from './DataDisplay';
import {
    Bodies,
    Composite,
    Engine,
    Events,
    IEventTimestamped,
    Runner,
    World
} from 'matter-js';
import { useCurrentScreenSize } from '../hooks/use-current-screen-size';
import { ColorType, ELiveDataEventTriggers, NoteCutDirection } from '../model/bsdp';
import { getNoteSprite, Render } from '../utils/note-pile';

const DEFAULT_LEFT_SABER_COLOR = '#a82020';
const DEFAULT_RIGHT_SABER_COLOR = '#2064a8';

/**
 * Renders a pile of notes affected by physics for each missed note
 */
export const NotePile: FC<{ dataSource: DataDisplayProps }> = ({ dataSource }) => {
    const [notesPileCanvasRef, setNotesPileCanvasRef] = useState<HTMLCanvasElement | null>(null);
    const screenSize = useCurrentScreenSize();
    const engineRef = useRef<Engine | null>(null);
    const amounts = useMemo(() => ({
        wallSize: screenSize.width * 0.012,
        blockSize: screenSize.width * 0.015,
        baseTorque: 1e5,
        horizontalForceMax: screenSize.width * 0.04,
        clearThrowForceY: screenSize.width / 20,
        clearThrowForceXMax: 50,
    }), [screenSize.width]);

    const colors: Record<number, string> = useMemo(() => ({
        [ColorType.ColorA]: dataSource.mapData?.leftSaberColor ?? DEFAULT_LEFT_SABER_COLOR,
        [ColorType.ColorB]: dataSource.mapData?.rightSaberColor ?? DEFAULT_RIGHT_SABER_COLOR,
    }), [dataSource.mapData?.leftSaberColor, dataSource.mapData?.rightSaberColor]);

    const addBlock = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Will be used later
        (cutDirection: number = NoteCutDirection.None, color: number = ColorType.None) => {
            const engine = engineRef.current;
            if (!engine || color === ColorType.None) return;

            const screenCenterX = screenSize.width / 2;
            const spawnY = amounts.blockSize * -2;
            const density = 1;
            const box = Bodies.rectangle(screenCenterX + (Math.random() - 0.5) * amounts.blockSize * 5, spawnY, amounts.blockSize, amounts.blockSize, {
                chamfer: { radius: 5 },
                torque: (Math.random() - 0.5) * amounts.baseTorque,
                render: {
                    fillStyle: colors[color],
                    lineWidth: amounts.blockSize * 0.075,
                    strokeStyle: 'rgba(0,0,0,.5)',
                    sprite: getNoteSprite(cutDirection)
                },
                density,
                frictionAir: .02,
                force: {
                    x: amounts.horizontalForceMax * (Math.random() - 0.5),
                    y: 0,
                },
            });
            Composite.add(engine.world, [box]);
        },
        [screenSize.width, amounts.blockSize, amounts.baseTorque, amounts.horizontalForceMax, colors]
    );

    /**
     * Removing the bodies when they go outside the screen
     */
    const cleanupBodies = useCallback((event: IEventTimestamped<Engine>) => {
        if (event.name !== 'afterUpdate') {
            return;
        }
        const engine = engineRef.current;
        if (!engine) return;
        const yThreshold = screenSize.height * 2;
        if (yThreshold === 0) return;

        for (const body of engine.world.bodies) {
            if (body.position.y > yThreshold) {
                World.remove(engine.world, body);
            }
        }
    }, [screenSize.height]);

    /**
     * Throw blocks into the ari a bit and apply a collision filter,
     * so they can fall below the cleanup threshold
     */
    const clearBlocks = useCallback(() => {
        const engine = engineRef.current;
        if (!engine) return;

        Composite.allBodies(engine.world).forEach((body) => {
            if (!body.render.visible) return;

            body.collisionFilter = {
                mask: 1,
                group: 1,
            };
            body.force = {
                x: amounts.clearThrowForceXMax * (Math.random() - 0.5),
                y: -amounts.clearThrowForceY,
            };
        });
    }, [amounts.clearThrowForceXMax, amounts.clearThrowForceY]);

    const trigger = dataSource.liveData?.trigger;
    const cutDirection = dataSource.liveData?.cutDirection;
    const color = dataSource.liveData?.color;
    useEffect(() => {
        if (trigger !== ELiveDataEventTriggers.NoteMissed) {
            return;
        }

        // If the event was fired due to a miss
        addBlock(cutDirection, color);
    }, [addBlock, color, cutDirection, trigger]);

    useEffect(() => {
        if (dataSource.mapData?.inLevel !== true) {
            clearBlocks();
        }
    }, [clearBlocks, dataSource.mapData?.inLevel, dataSource.readyState]);

    useEffect(() => {
        if (!notesPileCanvasRef) return;

        // create an engine
        let engine: Engine;
        if (engineRef.current === null) {
            engine = Engine.create();
            engineRef.current = engine;
        } else {
            engine = engineRef.current;
        }

        // create a renderer
        const render = Render.create({
            canvas: notesPileCanvasRef,
            engine,
            options: {
                width: screenSize.width,
                height: screenSize.height,
                wireframes: false,
                background: 'transparent',
            }
        });
        const screenCenterX = screenSize.width / 2;
        const screenCenterY = screenSize.height / 2;

        // create a ground
        const groundSizeHalf = amounts.wallSize / 2;
        const ground = Bodies.rectangle(screenCenterX, screenSize.height + groundSizeHalf, screenSize.width, amounts.wallSize, {
            isStatic: true,
            render: { visible: false }
        });
        const leftWall = Bodies.rectangle(0 - groundSizeHalf, screenCenterY, amounts.wallSize, screenSize.height, {
            isStatic: true,
            render: { visible: false }
        });
        const rightWall = Bodies.rectangle(screenSize.width + groundSizeHalf, screenCenterY, amounts.wallSize, screenSize.height, {
            isStatic: true,
            render: { visible: false }
        });

        // add all bodies to the world
        Composite.add(engine.world, [leftWall, ground, rightWall]);

        // run the renderer
        Render.run(render);

        // create runner
        const runner = Runner.create();

        // run the engine
        Runner.run(runner, engine);

        // Adding the event listener
        Events.on(engine, 'afterUpdate', cleanupBodies);

        // unmount
        return () => {
            // destroy Matter
            Render.stop(render);
            World.clear(engine.world, false);
            Engine.clear(engine);
            render.textures = {};
            engineRef.current = null;
            window.removeEventListener('contextmenu', clearBlocks);
        };
    }, [addBlock, notesPileCanvasRef, screenSize.height, screenSize.width, amounts.wallSize, clearBlocks, cleanupBodies]);

    return <canvas
        ref={setNotesPileCanvasRef}
        width={screenSize.width}
        height={screenSize.height}
    />;
};
