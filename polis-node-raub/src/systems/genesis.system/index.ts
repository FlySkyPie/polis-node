import type { World } from "miniplex";
import { Color, Scene, } from "three";

import type { ISystem } from "../../interfaces/system.interface";
import type { IEntity, IThreeSingletonEntity } from "../../entities";


export class GenesisSystem implements ISystem {
    async init(world: World<IEntity>) {
        world.add<IThreeSingletonEntity>((() => {
            const scene = new Scene();
            scene.background = new Color(0xeeeeee);

            return {
                threeComponent: {
                    scene,
                },
            };
        })());

        // world.add<ISpectatorEntity>((() => {
        //     const camera = new PerspectiveCamera(70, 1, 1, 1000);
        //     camera.position.z = 25;

        //     const renderTarget = new WebGLRenderTarget(500, 500, {
        //         depthBuffer: false,
        //     });

        //     return { camera, renderTarget, buffer: new Uint8Array() };
        // })());
    }

    tick(_world: unknown, _queries: unknown): void {
        throw new Error("Method not implemented.");
    }

    async dispose(): Promise<void> {
        throw new Error("Method not implemented.");
    }
};
