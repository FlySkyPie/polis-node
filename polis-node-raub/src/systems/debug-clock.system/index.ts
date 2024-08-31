import type { Query, With, World } from "miniplex";
import { BufferGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";
import dayjs from "dayjs";
import createText from '@flyskypie/three-bmfont-text';

import type { IEntity, IDebugClockEntity } from "../../entities";
import type { ISystem } from "../../interfaces/system.interface";

/**
 * Handle the clock used to test latency.
 */
export class DebugClockSystem implements ISystem {
    private queryDebugClock!: Query<With<IEntity, "object3D" | "mesh" | "isDebugClock">>;
    private queryFont!: Query<With<IEntity, "name" | "font">>;

    async init(world: World<IEntity>) {
        const queryThree = world.with('threeComponent');
        const queryFontTexture = world.with('name', 'texture');
        const queryFont = world.with('name', 'font');
        const queryDebugClock = world.with('object3D', 'mesh', 'isDebugClock');

        const { threeComponent: { scene } } = queryThree.first!;
        world.add<IDebugClockEntity>((() => {
            const material = new MeshBasicMaterial({
                map: queryFontTexture.first!.texture,
                transparent: true,
                color: 'rgb(230, 230, 230)'
            });
            const geometry: BufferGeometry = createText({
                text: dayjs().format('HH:mm:ss SSS'),
                font: queryFont.first!.font,
                width: 1000,
            });
            const mesh = new Mesh(geometry, material);

            // scale it down so it fits in our 3D units
            const textAnchor = new Object3D();
            textAnchor.scale.set(0.05, -0.05, -0.05);
            textAnchor.position.setX(-1000 * 0.05 * 0.5 * 0.5)
            textAnchor.add(mesh);
            scene.add(textAnchor);

            return {
                isDebugClock: true,
                mesh: mesh,
                object3D: textAnchor,
            };
        })());

        this.queryDebugClock = queryDebugClock;
        this.queryFont = queryFont;
    }

    tick(world: World<IEntity>): void {
        const geom: BufferGeometry = createText({
            text: dayjs().format('HH:mm:ss SSS'),
            font: this.queryFont.first!.font,
            width: 1000,
        });

        const { mesh: text } = this.queryDebugClock.first!;
        const old = text.geometry;
        text.geometry = geom;
        old.dispose();
    }

    async dispose(): Promise<void> {
        throw new Error("Method not implemented.");
    }
};