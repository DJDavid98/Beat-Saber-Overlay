import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataDisplayProps } from './DataDisplay';
import { Engine, Composite, World, Render, Runner, Bodies } from 'matter-js';
import { useCurrentScreenSize } from '../hooks/use-current-screen-size';
import { ColorType, ELiveDataEventTriggers, NoteCutDirection } from '../model/bsdp';

const DEFAULT_LEFT_SABER_COLOR = '#a82020';
const DEFAULT_RIGHT_SABER_COLOR = '#2064a8';

/**
 * Renders a pile of notes affected by physics for each missed note (WIP)
 *
 * TODO Add sprites for dot/directional notes
 * TODO Add a clear sequence after level completion
 */
export const NotePile: FC<{ dataSource: DataDisplayProps }> = ({ dataSource }) => {
    const [notesPileCanvasRef, setNotesPileCanvasRef] = useState<HTMLCanvasElement | null>(null);
    const screenSize = useCurrentScreenSize();
    const engineRef = useRef<Engine | null>(null);
    const amounts = useMemo(() => ({
        walls: screenSize.width * 0.012,
        blocks: screenSize.width * 0.015,
        baseTorque: screenSize.width * 4,
        randomTorqueMax: screenSize.width * 0.4,
        horizontalForceMax: screenSize.width * 0.04,
    }), [screenSize.width]);

    const colors: Record<number, string> = useMemo(() => ({
        [ColorType.ColorA]: dataSource.mapData?.leftSaberColor ?? DEFAULT_LEFT_SABER_COLOR,
        [ColorType.ColorB]: dataSource.mapData?.rightSaberColor ?? DEFAULT_RIGHT_SABER_COLOR,
    }), [dataSource.mapData?.leftSaberColor, dataSource.mapData?.rightSaberColor]);

    const addBox = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Will be used later
        (cutDirection: number = NoteCutDirection.None, color: number = ColorType.None) => {
            const engine = engineRef.current;
            if (!engine || color === ColorType.None) return;

            const screenCenterX = screenSize.width / 2;
            const spawnY = amounts.blocks * -2;
            const density = 1;
            const box = Bodies.rectangle(screenCenterX, spawnY, amounts.blocks, amounts.blocks, {
                chamfer: { radius: 5 },
                torque: amounts.baseTorque + (Math.random() - 0.5) * amounts.randomTorqueMax,
                render: {
                    fillStyle: colors[color],
                    lineWidth: amounts.blocks * 0.075,
                    strokeStyle: 'rgba(0,0,0,.5)',
                    // TODO Find a way to render both sprite AND fill
                    // sprite: getNoteSprite(cutDirection)
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
        [screenSize.width, amounts.blocks, amounts.baseTorque, amounts.randomTorqueMax, amounts.horizontalForceMax, colors]
    );

    const trigger = dataSource.liveData?.trigger;
    const cutDirection = dataSource.liveData?.cutDirection;
    const color = dataSource.liveData?.color;
    useEffect(() => {
        if (trigger !== ELiveDataEventTriggers.NoteMissed) {
            return;
        }

        // If the event was fired due to a miss
        addBox(cutDirection, color);
    }, [addBox, color, cutDirection, trigger]);

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
        const groundSizeHalf = amounts.walls / 2;
        const ground = Bodies.rectangle(screenCenterX, screenSize.height + groundSizeHalf, screenSize.width, amounts.walls, {
            isStatic: true,
            render: { visible: false }
        });
        const leftWall = Bodies.rectangle(0 - groundSizeHalf, screenCenterY, amounts.walls, screenSize.height, {
            isStatic: true,
            render: { visible: false }
        });
        const rightWall = Bodies.rectangle(screenSize.width + groundSizeHalf, screenCenterY, amounts.walls, screenSize.height, {
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

        // unmount
        return () => {
            // destroy Matter
            Render.stop(render);
            World.clear(engine.world, false);
            Engine.clear(engine);
            render.textures = {};
            engineRef.current = null;
        };
    }, [addBox, notesPileCanvasRef, screenSize.height, screenSize.width, amounts.walls]);

    return <canvas
        ref={setNotesPileCanvasRef}
        width={screenSize.width}
        height={screenSize.height}
    />;
};
