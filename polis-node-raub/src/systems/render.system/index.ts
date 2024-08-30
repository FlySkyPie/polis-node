import type { Document } from '3d-core-raub';
import type { Query, With, World } from 'miniplex';
import { LinearSRGBColorSpace, NoToneMapping, WebGLRenderer } from "three";

import type { ISystem } from "../../interfaces/system.interface";
import type { IEntity } from '../../entities';

export class RenderSystem implements ISystem {
    /**
     * @todo Change it to private after finished ECS migration.
     */
    private renderer: WebGLRenderer;

    private querySpectator!: Query<With<IEntity, "camera" | "renderTarget">>;

    private queryThree!: Query<With<IEntity, "threeComponent">>;

    constructor(doc: Document) {
        const renderer = new WebGLRenderer({
            antialias: false,
            alpha: false,
            depth: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
        });
        renderer.shadowMap.autoUpdate = false;
        renderer.outputColorSpace = LinearSRGBColorSpace;
        renderer.toneMapping = NoToneMapping;
        renderer.setPixelRatio(doc.devicePixelRatio);
        renderer.setSize(doc.innerWidth, doc.innerHeight);

        this.renderer = renderer;
    }

    async init(world: World<IEntity>) {
        const querySpectator = world.with('camera', 'renderTarget');
        const queryThree = world.with('threeComponent');

        this.querySpectator = querySpectator;
        this.queryThree = queryThree;
    }

    tick(world: World<IEntity>): void {
        const { threeComponent: { scene } } = this.queryThree.first!;

        for (const spectator of this.querySpectator) {
            const { renderTarget, camera } = spectator;
            this.renderer.setRenderTarget(renderTarget);
            this.renderer.render(scene, camera);

            const { width, height } = renderTarget;
            const buffer = new Uint8Array(width * height * 4);

            this.renderer.readRenderTargetPixels(
                renderTarget,
                0, 0,
                width, height,
                buffer);
            spectator.buffer = buffer;
        }


        this.renderer.setRenderTarget(null);
    }

    dispose(): Promise<void> {
        throw new Error("Method not implemented.");
    }
};