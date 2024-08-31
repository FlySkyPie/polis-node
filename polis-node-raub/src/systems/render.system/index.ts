import type { Document } from '3d-core-raub';
import type { Query, With, World } from 'miniplex';
import { LinearSRGBColorSpace, NoToneMapping, WebGLRenderer } from "three";
import sharp from 'sharp';
import { nonstandard, MediaStream } from 'wrtc';

import type { ISystem } from "../../interfaces/system.interface";
import type { IEntity, ISpectatorEntity } from '../../entities';

export class RenderSystem implements ISystem {
    /**
     * @todo Change it to private after finished ECS migration.
     */
    private renderer: WebGLRenderer;

    private querySpectator!: Query<ISpectatorEntity>;

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
        const querySpectator = world.with('id', 'camera', 'renderTarget', 'source');
        const queryThree = world.with('threeComponent');

        this.querySpectator = querySpectator;
        this.queryThree = queryThree;
    }

    tick(world: World<IEntity>): void {
        const { threeComponent: { scene } } = this.queryThree.first!;

        for (const spectator of this.querySpectator) {
            const { renderTarget, camera, source } = spectator;
            this.renderer.setRenderTarget(renderTarget);
            this.renderer.render(scene, camera);

            const { width, height } = renderTarget;
            const buffer = new Uint8Array(width * height * 4);

            this.renderer.readRenderTargetPixels(
                renderTarget,
                0, 0,
                width, height,
                buffer);

            sharp(buffer, {
                raw: {
                    width: width,
                    height: height,
                    channels: 4,
                }
            }).flip()
                .toBuffer()
                .then(buffer => {
                    const i420Data = new Uint8ClampedArray(width * height * 1.5);
                    const i420Frame = { width: width, height: height, data: i420Data };
                    const rgbaFrame = { width: width, height: height, data: buffer };

                    nonstandard.rgbaToI420(rgbaFrame, i420Frame);

                    //@ts-ignore The third party type declaration is not complete.
                    source.onFrame(i420Frame);
                });
        }

        this.renderer.setRenderTarget(null);
    }

    dispose(): Promise<void> {
        throw new Error("Method not implemented.");
    }
};