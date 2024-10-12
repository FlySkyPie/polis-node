import type { World } from "miniplex";

import type { IEntity, IThreeEntity, } from "../../entities";
import type { ISystem } from "../../interfaces/system.interface";
import { Mesh, BoxGeometry, MeshBasicMaterial, AxesHelper, GridHelper } from "three";

/**
 * Add sample objects to test render.
 */
export class SampleSystem implements ISystem {
    async init(world: World<IEntity>): Promise<void> {
        const queryThree = world.with('threeComponent');

        const objectEntities: IThreeEntity[] = [{
            object3D: new Mesh(
                new BoxGeometry(),
                new MeshBasicMaterial({ color: 0xFACE8D })),
        }, {
            object3D: new AxesHelper(20),
        }, {
            object3D: (() => {
                const size = 20;
                const divisions = 10;
                const gridHelper = new GridHelper(size, divisions);
                gridHelper.rotateX(Math.PI * 0.5);

                return gridHelper;
            })(),
        }];

        for (const { object3D } of objectEntities) {
            const { threeComponent: { scene } } = queryThree.first!;
            scene.add(object3D);
        }
    }
    tick(_world: unknown, _queries: unknown): void {
        throw new Error("Method not implemented.");
    }
    dispose(): Promise<void> {
        throw new Error("Method not implemented.");
    }

};